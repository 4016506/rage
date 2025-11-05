import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RageMeter from './components/RageMeter';
import History from './components/History';
import { onAuthChange } from './services/authService';
import type { User } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RageMeter user={user} />} />
        <Route path="/history" element={<History user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;

