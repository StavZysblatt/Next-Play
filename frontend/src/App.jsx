import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { useState, useEffect } from 'react';
import SignUp from './components/SignUp';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Navbar from './components/Navbar';

function App() {
  const [userId, setUserId] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Check for existing user on app load
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    
    if (storedUserId) {
      setUserId(storedUserId);
      setIsOnboardingComplete(onboardingComplete);
    }
  }, []);

  // Handle user signup
  const handleSignUp = (newUserId) => {
    setUserId(newUserId);
    localStorage.setItem('userId', newUserId);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
    localStorage.setItem('onboardingComplete', 'true');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('onboardingComplete');
    setUserId(null);
    setIsOnboardingComplete(false);
  };

  // Show signup if no user
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SignUp onSignUp={handleSignUp} />
      </div>
    );
  }

  // Show onboarding if user exists but hasn't completed onboarding
  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Onboarding userId={userId} onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Main app with navigation
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard userId={userId} />} />
            <Route path="/profile" element={<Profile userId={userId} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
