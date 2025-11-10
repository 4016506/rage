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
function getCurrentDatePST(baseDate: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles'
  }).format(baseDate);
}

/**
 * Get current day of week (0 = Sunday, 1 = Monday, etc.) in PST
 */
function getCurrentDayOfWeekPST(baseDate: Date = new Date()): number {
  return new Date(baseDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).getDay();
}

/**
 * Determine the offset (in minutes) between PST/PDT and UTC for a given date
 */
function getPSTOffsetMinutes(baseDate: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).formatToParts(baseDate);

  const timeZoneName = parts.find((part) => part.type === 'timeZoneName')?.value || 'PST';
  return timeZoneName === 'PDT' ? -420 : -480;
}

/**
 * Get the Date object representing midnight (start of day) in PST for provided date
 */
function getStartOfDayPST(baseDate: Date = new Date()): Date {
  const dateString = getCurrentDatePST(baseDate);
  const [year, month, day] = dateString.split('-').map(Number);
  const offsetMinutes = getPSTOffsetMinutes(baseDate);

  const utcMillis = Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMinutes * 60 * 1000;
  return new Date(utcMillis);
}

/**
 * Initialize or get current stats
 */
export async function getRageStats(): Promise<RageStats> {
  const statsDoc = await getDoc(doc(db, 'stats', STATS_DOC_ID));
  
  if (!statsDoc.exists()) {
    // Initialize stats
    const today = getCurrentDatePST();
    const startOfDay = getStartOfDayPST();
    const initialStats: RageStats = {
      currentScore: 0,
      today,
      allTimeHigh: 0,
      weeklyTotal: 0,
      monthlyTotal: 0,
      lastReset: Timestamp.fromDate(startOfDay)
    };
    
    await setDoc(doc(db, 'stats', STATS_DOC_ID), initialStats);
    return initialStats;
  }
  
  const data = statsDoc.data();
  
  // Check if we need to reset for a new day
  const now = new Date();
  const currentDate = getCurrentDatePST(now);
  const lastResetDateStr = data.lastReset
    ? getCurrentDatePST(data.lastReset.toDate())
    : null;

  if (data.today !== currentDate || lastResetDateStr !== currentDate) {
    const lastReset = getStartOfDayPST(now);
    
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
  const dayOfWeek = getCurrentDayOfWeekPST(now);
  
  // Reset weekly if it's Monday and we haven't reset yet today
  if (dayOfWeek === 1 && lastResetDateStr !== currentDate) {
    const resetTimestamp = getStartOfDayPST(now);

    await updateDoc(doc(db, 'stats', STATS_DOC_ID), {
      weeklyTotal: 0,
      monthlyTotal: 0,
      lastReset: Timestamp.fromDate(resetTimestamp)
    });

    data.weeklyTotal = 0;
    data.monthlyTotal = 0;
    data.lastReset = Timestamp.fromDate(resetTimestamp);
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
 * Calculate the true all-time high from historical daily scores
 * This includes all saved daily scores, which represents what was actually achieved
 */
async function calculateTrueAllTimeHigh(): Promise<number> {
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
  
  return maxScore;
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
  
  // If current score was the all-time high, recalculate the true all-time high
  if (stats.currentScore === stats.allTimeHigh && stats.currentScore > 0) {
    const trueAllTimeHigh = await calculateTrueAllTimeHigh();
    updates.allTimeHigh = trueAllTimeHigh;
  }
  
  await updateDoc(statsRef, updates);
}

/**
 * Set rage score to a specific value
 */
export async function setRageScore(targetScore: number): Promise<void> {
  if (targetScore < 0) {
    throw new Error('Rage score cannot be negative');
  }
  
  const stats = await getRageStats();
  const statsRef = doc(db, 'stats', STATS_DOC_ID);
  const difference = targetScore - stats.currentScore;
  
  // Update current score and adjust weekly/monthly totals by the difference
  const updates: any = {
    currentScore: targetScore,
    weeklyTotal: increment(difference),
    monthlyTotal: increment(difference)
  };
  
  // Handle all-time high update
  if (targetScore > stats.allTimeHigh) {
    // New score is higher than current all-time high
    updates.allTimeHigh = targetScore;
  } else if (stats.currentScore === stats.allTimeHigh && targetScore < stats.currentScore) {
    // We're lowering the score, and the current score WAS the all-time high
    // Need to recalculate the true all-time high from historical records
    // This ensures we use the actual saved maximum, not the temporary unsaved score
    const trueAllTimeHigh = await calculateTrueAllTimeHigh();
    // Use the max of historical records and the new target score (in case target is still high)
    // But if historical records are higher, use those (they represent saved achievements)
    updates.allTimeHigh = Math.max(trueAllTimeHigh, targetScore);
  } else if (stats.currentScore === stats.allTimeHigh && targetScore === 0) {
    // Special case: resetting to 0 when current score was the all-time high
    const trueAllTimeHigh = await calculateTrueAllTimeHigh();
    updates.allTimeHigh = trueAllTimeHigh;
  }
  // If targetScore <= stats.allTimeHigh but currentScore !== allTimeHigh,
  // we don't need to change allTimeHigh (it's still valid)
  
  await updateDoc(statsRef, updates);
}

/**
 * Clear all statistics
 */
export async function clearAllStats(): Promise<void> {
  const now = new Date();
  const today = getCurrentDatePST(now);
  const startOfDay = getStartOfDayPST(now);
  await setDoc(doc(db, 'stats', STATS_DOC_ID), {
    currentScore: 0,
    today,
    allTimeHigh: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    lastReset: Timestamp.fromDate(startOfDay)
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

