import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRageStats, incrementRage, resetCurrentScore, clearAllStats } from '../services/rageService';
import { signIn, signOut } from '../services/authService';
import type { User } from 'firebase/auth';
import type { RageStats } from '../services/rageService';
import './RageMeter.css';

interface RageMeterProps {
  user: User | null;
}

function RageMeter({ user }: RageMeterProps) {
  const [stats, setStats] = useState<RageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMashing, setIsMashing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [intensity, setIntensity] = useState(0);
  const [showDevButtons, setShowDevButtons] = useState(false);

  // Hide dev buttons when user signs out
  useEffect(() => {
    if (!user) {
      setShowDevButtons(false);
    }
  }, [user]);

  const loadStats = useCallback(async () => {
    try {
      const rageStats = await getRageStats();
      setStats(rageStats);
      setIntensity(Math.min(rageStats.currentScore / 100, 1));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Auto-load stats every second
  useEffect(() => {
    const interval = setInterval(loadStats, 1000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const handleKeyPress = useCallback(async (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      if (isMashing) return;

      setIsMashing(true);
      setIntensity(1);
      
      try {
        await incrementRage(1);
        await loadStats();
      } catch (error) {
        console.error('Error incrementing rage:', error);
      }
      
      // Reset intensity over time
      setTimeout(() => {
        setIntensity(0);
      }, 200);
      
      setTimeout(() => {
        setIsMashing(false);
      }, 100);
    }
  }, [user, isMashing, loadStats]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      await signIn(email, password);
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError('Invalid credentials');
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleResetScore = async () => {
    if (!user) {
      alert('You must be signed in to reset the score.');
      return;
    }
    
    if (confirm('Are you sure you want to reset the current score?')) {
      try {
        await resetCurrentScore();
        await loadStats();
      } catch (error) {
        console.error('Reset error:', error);
      }
    }
  };

  const handleClearStats = async () => {
    if (!user) {
      alert('You must be signed in to clear statistics.');
      return;
    }
    
    if (confirm('⚠️ WARNING: This will clear ALL statistics. Are you absolutely sure?')) {
      try {
        await clearAllStats();
        await loadStats();
      } catch (error) {
        console.error('Clear stats error:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="rage-container">
        <div className="loading-text">LOADING RAGE...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rage-container">
        <div className="error-text">ERROR LOADING RAGE DATA</div>
      </div>
    );
  }

  const flameIntensity = intensity * 100;
  const glowIntensity = intensity * 50;

  return (
    <div className="rage-container">
      {/* Dev button toggle */}
      <button 
        className="dev-toggle"
        onClick={() => setShowDevButtons(!showDevButtons)}
        disabled={!user}
        title={!user ? 'Sign in to access dev controls' : ''}
      >
        {showDevButtons ? 'HIDE' : 'SHOW'} DEV
      </button>

      {/* Navigation */}
      <nav className="rage-nav">
        <Link to="/history" className="nav-link">📊 HISTORY</Link>
      </nav>

      {/* Auth section */}
      <div className="auth-section">
        {user ? (
          <div className="user-info">
            <span className="authenticated-indicator">✓ AUTHENTICATED</span>
            <button onClick={handleSignOut} className="sign-out-btn">SIGN OUT</button>
          </div>
        ) : (
          <div className="auth-prompt">
            <span className="unauthenticated-indicator">⚠ NOT AUTHENTICATED</span>
            <button onClick={() => setShowAuthModal(true)} className="sign-in-btn">SIGN IN TO MASH</button>
          </div>
        )}
      </div>

      {/* Main rage display */}
      <div className="rage-display">
        <div 
          className="rage-number" 
          style={{
            filter: `drop-shadow(0 0 ${glowIntensity}px #ff4500)`,
            transform: isMashing ? 'scale(1.3)' : 'scale(1)',
            animation: isMashing ? 'shake 0.3s' : 'none'
          }}
        >
          {stats.currentScore.toLocaleString()}
        </div>
        <div className="rage-label">RAGE SCORE</div>
        
        {/* Flames effect */}
        <div 
          className="flames"
          style={{ opacity: flameIntensity / 100 }}
        >
          <div className="flame flame-1"></div>
          <div className="flame flame-2"></div>
          <div className="flame flame-3"></div>
        </div>

        {!user && (
          <div className="spacebar-hint">
            🔥 MASH SPACEBAR TO INCREASE RAGE 🔥
            <div className="hint-subtitle">(Requires authentication)</div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">ALL-TIME HIGH</div>
          <div className="stat-value red-glow">{stats.allTimeHigh.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">WEEKLY TOTAL</div>
          <div className="stat-value orange-glow">{stats.weeklyTotal.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">MONTHLY TOTAL</div>
          <div className="stat-value yellow-glow">{stats.monthlyTotal.toLocaleString()}</div>
        </div>
      </div>

      {/* Developer buttons */}
      {showDevButtons && user && (
        <div className="dev-buttons">
          <button onClick={handleResetScore} className="dev-btn reset-btn">
            RESET CURRENT SCORE
          </button>
          <button onClick={handleClearStats} className="dev-btn clear-btn">
            CLEAR ALL STATISTICS
          </button>
        </div>
      )}

      {/* Auth modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">AUTHENTICATION REQUIRED</h2>
            <form onSubmit={handleSignIn}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
              {authError && <div className="auth-error">{authError}</div>}
              <button type="submit" className="auth-submit-btn">SIGN IN</button>
              <button 
                type="button" 
                className="auth-cancel-btn"
                onClick={() => setShowAuthModal(false)}
              >
                CANCEL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RageMeter;

