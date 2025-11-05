import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  query,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface RageStats {
  currentScore: number;
  today: string; // YYYY-MM-DD format
  allTimeHigh: number;
  weeklyTotal: number;
  monthlyTotal: number;
  lastReset: Timestamp;
}

export interface DailyRage {
  date: string;
  score: number;
  timestamp: Timestamp;
}

export interface RageRecord {
  date: string;
  score: number;
}

const STATS_DOC_ID = 'rage_stats';
const DAILY_COLLECTION = 'daily_rage';

/**
 * Get current date in YYYY-MM-DD format in PST timezone
 */
function getCurrentDatePST(): string {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return pstDate.toISOString().split('T')[0];
}

/**
 * Get current day of week (0 = Sunday, 1 = Monday, etc.) in PST
 */
function getCurrentDayOfWeekPST(): number {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return pstDate.getDay();
}

/**
 * Get current timestamp in PST
 */
function getCurrentTimestampPST(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
}

/**
 * Initialize or get current stats
 */
export async function getRageStats(): Promise<RageStats> {
  const statsDoc = await getDoc(doc(db, 'stats', STATS_DOC_ID));
  
  if (!statsDoc.exists()) {
    // Initialize stats
    const today = getCurrentDatePST();
    const initialStats: RageStats = {
      currentScore: 0,
      today,
      allTimeHigh: 0,
      weeklyTotal: 0,
      monthlyTotal: 0,
      lastReset: Timestamp.fromDate(getCurrentTimestampPST())
    };
    
    await setDoc(doc(db, 'stats', STATS_DOC_ID), initialStats);
    return initialStats;
  }
  
  const data = statsDoc.data();
  
  // Check if we need to reset for a new day
  const currentDate = getCurrentDatePST();
  if (data.today !== currentDate) {
    const lastReset = getCurrentTimestampPST();
    lastReset.setHours(0, 0, 0, 0);
    
    const stats: RageStats = {
      currentScore: 0,
      today: currentDate,
      allTimeHigh: data.allTimeHigh || 0,
      weeklyTotal: data.weeklyTotal || 0,
      monthlyTotal: data.monthlyTotal || 0,
      lastReset: Timestamp.fromDate(lastReset)
    };
    
    await setDoc(doc(db, 'stats', STATS_DOC_ID), stats);
    return stats;
  }
  
  // Check if we need to reset weekly total (Monday)
  const dayOfWeek = getCurrentDayOfWeekPST();
  const lastResetDate = data.lastReset.toDate();
  const lastResetDateStr = lastResetDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).split(',')[0];
  const currentDateStr = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).split(',')[0];
  
  // Reset weekly if it's Monday and we haven't reset yet today
  if (dayOfWeek === 1 && lastResetDateStr !== currentDateStr) {
    await updateDoc(doc(db, 'stats', STATS_DOC_ID), {
      weeklyTotal: 0,
      monthlyTotal: 0
    });
  }
  
  return data as RageStats;
}

/**
 * Increment rage score
 */
export async function incrementRage(amount: number = 1): Promise<void> {
  const stats = await getRageStats();
  
  const statsRef = doc(db, 'stats', STATS_DOC_ID);
  
  const updates: any = {
    currentScore: increment(amount),
    weeklyTotal: increment(amount),
    monthlyTotal: increment(amount)
  };
  
  await updateDoc(statsRef, updates);
  
  // Update all-time high if needed
  const newScore = stats.currentScore + amount;
  if (newScore > stats.allTimeHigh) {
    await updateDoc(statsRef, {
      allTimeHigh: newScore
    });
  }
}

/**
 * Reset current score to 0
 */
export async function resetCurrentScore(): Promise<void> {
  const stats = await getRageStats();
  const statsRef = doc(db, 'stats', STATS_DOC_ID);
  const amountToDeduct = stats.currentScore;
  
  // Deduct from weekly and monthly totals
  const updates: any = {
    currentScore: 0,
    weeklyTotal: increment(-amountToDeduct),
    monthlyTotal: increment(-amountToDeduct)
  };
  
  // If current score was the all-time high, find the new all-time high
  if (stats.currentScore === stats.allTimeHigh && stats.currentScore > 0) {
    // Get all historical daily scores to find the new max
    const dailyQuery = query(collection(db, DAILY_COLLECTION));
    const snapshot = await getDocs(dailyQuery);
    let maxScore = 0;
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const score = data.score || 0;
      if (score > maxScore) {
        maxScore = score;
      }
    });
    
    // Also check if weekly or monthly totals could be higher (though unlikely)
    // But the all-time high should be based on daily scores, not totals
    updates.allTimeHigh = maxScore;
  }
  
  await updateDoc(statsRef, updates);
}

/**
 * Clear all statistics
 */
export async function clearAllStats(): Promise<void> {
  const today = getCurrentDatePST();
  await setDoc(doc(db, 'stats', STATS_DOC_ID), {
    currentScore: 0,
    today,
    allTimeHigh: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    lastReset: Timestamp.fromDate(getCurrentTimestampPST())
  });
  
  // Clear daily collection
  const dailyQuery = query(collection(db, DAILY_COLLECTION));
  const snapshot = await getDocs(dailyQuery);
  snapshot.docs.forEach(async (docSnapshot) => {
    await setDoc(doc(db, DAILY_COLLECTION, docSnapshot.id), {
      score: 0
    }, { merge: true });
  });
}

/**
 * Get historical rage scores
 */
export async function getHistoricalRage(): Promise<RageRecord[]> {
  const querySnapshot = await getDocs(collection(db, DAILY_COLLECTION));
  const records: RageRecord[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    records.push({
      date: doc.id,
      score: data.score || 0
    });
  });
  
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Save today's score to history
 */
export async function saveDailyScore(): Promise<void> {
  const stats = await getRageStats();
  const today = getCurrentDatePST();
  
  await setDoc(doc(db, DAILY_COLLECTION, today), {
    date: today,
    score: stats.currentScore,
    timestamp: Timestamp.now()
  });
}

