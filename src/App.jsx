import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google'

import {
  Heart, LogOut, Plus, Trash2, Eye, EyeOff, ChevronRight,
  AlertCircle, CheckCircle, Clock, TrendingUp, Brain, Activity,
  Calendar, Pill, MessageSquare, Loader, Download, Settings, Moon, Sun, Bell
} from 'lucide-react';
import LandingPage from './LandingPage';
import OnboardingWizard from './OnboardingWizard';
import MedicationCalendar from './MedicationCalendar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// API Service for now 
//for localhost add const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL = 'https://meditrack.up.railway.app/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    loading: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 
      rounded-xl border shadow-lg text-sm font-medium transition-all ${styles[type]}`}>
      {type === 'loading' && <Loader className="w-4 h-4 animate-spin flex-shrink-0" />}
      {type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </div>
  );
}


function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);

    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}


//for onboarding
function shouldShowOnboarding(user) {
  if (!user || user.role !== 'patient') return false;
  // Use username as key — avoids issues if API returns id under a different field name
  const key = `onboarding_complete_${user.username}`;
  return !localStorage.getItem(key);
}

// Main App 
export default function MediTrackApp() {

  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...');

      const token = localStorage.getItem('access_token');
      console.log('Token from storage:', token);

      if (!token) {
        console.log('No token found');
        return;
      }

      // Use API_BASE_URL instead of hardcoded URL
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data);
        setUser(data);
        setCurrentPage('dashboard');

        // Show onboarding only if: patient, no localStorage flag, AND no existing data
        if (shouldShowOnboarding(data)) {
          const token = localStorage.getItem('access_token');
          const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
          const [medsRes, sympRes] = await Promise.all([
            fetch(`${API_BASE_URL}/medications/`, { headers: authHeaders }),
            fetch(`${API_BASE_URL}/symptoms/`, { headers: authHeaders }),
          ]);
          const [meds, symp] = await Promise.all([medsRes.json(), sympRes.json()]);
          const hasData = (Array.isArray(meds) ? meds.length : meds?.results?.length ?? 0) > 0
            || (Array.isArray(symp) ? symp.length : symp?.results?.length ?? 0) > 0;
          if (hasData) {
            // User already has data — mark complete silently so it never shows again
            localStorage.setItem(`onboarding_complete_${data.username}`, 'true');
          } else {
            setShowOnboarding(true);
          }
        }
      } else {
        console.log('Profile fetch failed');
        localStorage.clear();
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      localStorage.clear();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentPage('login');
  };

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const downloadPDF = async (days = 30) => {
    showToast('Generating your health report...', 'loading');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/reports/export/?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meditrack_report_${days}days.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Report downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to download report. Try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-white">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Onbaording wizard overlay */}
      {showOnboarding && user && (
        <OnboardingWizard
          user={user}
          onComplete={() => setShowOnboarding(false)} />
      )}



      {/* Navigation Bar */}
      {user && (
        <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                MediTrack
              </h1>
            </button>

            <div className="flex items-center gap-6">

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
              <ThemeToggle />



              {/* Settings link */}
              <button
                onClick={() => setCurrentPage('profile')}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Page Content */}
      <div className="max-w-7xl mx-auto">
        {!user && currentPage === 'landing' && <LandingPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'login' && <LoginPage onSuccess={fetchProfile} setCurrentPage={setCurrentPage} />}
        {currentPage === 'register' && <RegisterPage setCurrentPage={setCurrentPage} onSuccess={fetchProfile} />}
        {currentPage === 'google-register' && <GoogleRegisterPage setCurrentPage={setCurrentPage} onSuccess={fetchProfile} />}
        {currentPage === 'dashboard' && user && (
          user.role === 'doctor' ? (
            <DoctorDashboardPage user={user} setCurrentPage={setCurrentPage} downloadPDF={downloadPDF} />
          ) : (
            <DashboardPage user={user} setCurrentPage={setCurrentPage} downloadPDF={downloadPDF} />
          )
        )}
        {currentPage === 'profile' && user && (
          <ProfilePage user={user} setCurrentPage={setCurrentPage} showToast={showToast} />  // ← this line exists
        )}
        {currentPage === 'medications' && user && (
          <MedicationsPage user={user} setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'symptoms' && user && (
          <SymptomsPage user={user} setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'insights' && user && (
          <InsightsPage user={user} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'history' && user && (
          <HistoryPage user={user} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'calendar' && user && (
          <MedicationCalendar user={user} setCurrentPage={setCurrentPage} />
        )}

      </div>
    </div>
  );
}

function LoginPage({ onSuccess, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { username: email, password });

      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password
        }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        setError('Invalid username or password');
        return;
      }

      const tokens = data.data || data;

      if (!tokens.access) {
        throw new Error('No access token received');
      }

      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      console.log('Login successful, fetching profile...');
      onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW: Google Login Handler
  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Google sign in failed');
        return;
      }

      if (data.is_new_user) {
        // Store Google data temporarily and go to username picker
        localStorage.setItem('google_pending', JSON.stringify(data));
        setCurrentPage('google-register');
      } else {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        onSuccess();
      }
    } catch (err) {
      setError('Google sign in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your health with MediTrack</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your username"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* ⭐ NEW: Google Sign In Button */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-200 dark:border-slate-600 w-full" />
              <span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400 absolute">or</span>
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Google sign in failed')}
                useOneTap
                shape="rectangular"
                theme="outline"
                size="large"
                text="signin_with"
                width="368"
              />
            </div>
          </div>

          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentPage('register')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
// Register Page with Google OAuth
function RegisterPage({ setCurrentPage, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password confirmation check
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      alert('Account created! Please login.');
      setCurrentPage('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW: Google Login Handler
  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Google sign up failed');
        return;
      }

      if (data.is_new_user) {
        // Store Google data temporarily and go to username picker
        localStorage.setItem('google_pending', JSON.stringify(data));
        setCurrentPage('google-register');
      } else {
        // User already exists, just log them in
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        onSuccess();
      }
    } catch (err) {
      setError('Google sign up failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Start managing your health today</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* ⭐ NEW: Google Sign Up Button */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-200 dark:border-slate-600 w-full" />
              <span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400 absolute">or</span>
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Google sign up failed')}
                useOneTap
                shape="rectangular"
                theme="outline"
                size="large"
                text="signup_with"
                width="368"
              />
            </div>
          </div>

          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentPage('login')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
// Google Register Completion Page
function GoogleRegisterPage({ setCurrentPage, onSuccess }) {
  const pending = JSON.parse(localStorage.getItem('google_pending') || '{}');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pending.email,
          username,
          google_id: pending.google_id,
          name: pending.name,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      localStorage.removeItem('google_pending');
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Almost there!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Signing in as <strong>{pending.email}</strong>
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Just pick a username to finish setting up your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Choose a Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sneha_health"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              I am a
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Setting up account...' : 'Complete Sign Up →'}
          </button>
        </form>
      </div>
    </div>
  );
}


//Dashboard Page
function DashboardPage({ user, setCurrentPage, downloadPDF }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/dashboard/');
      console.log("FULL DASHBOARD DATA:", data);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Export Health Report Bar */}
      {user.role === 'patient' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-4
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Export Health Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download a PDF summary of your medications, symptoms, mood and AI insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden text-sm">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDays(d)}
                  className={`px-3 py-1.5 font-medium transition-colors ${selectedDays === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            <button
              onClick={() => downloadPDF(selectedDays)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r
                from-blue-600 to-cyan-600 text-white text-sm font-semibold
                rounded-lg hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NavCard icon={<Pill className="w-6 h-6" />} label="Medications" onClick={() => setCurrentPage('medications')} />
        <NavCard icon={<Activity className="w-6 h-6" />} label="Symptoms" onClick={() => setCurrentPage('symptoms')} />
        <NavCard icon={<Calendar className="w-6 h-6" />} label="Adherence Calendar" onClick={() => setCurrentPage('calendar')} />
        <NavCard icon={<Brain className="w-6 h-6" />} label="AI Insights" onClick={() => setCurrentPage('insights')} />
        <NavCard icon={<Calendar className="w-6 h-6" />} label="History" onClick={() => setCurrentPage('history')} />
        <NavCard icon={<Settings className="w-6 h-6" />} label="Settings" onClick={() => setCurrentPage('profile')} />

      </div>

      {/* Stats Cards */}
      {dashboardData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Active Medications" value={dashboardData.stats.active_medications} icon={<Pill className="w-5 h-5" />} color="blue" />
          <StatCard title="Total Symptoms Logged" value={dashboardData.stats.total_symptoms_logged} icon={<Activity className="w-5 h-5" />} color="cyan" />
          <StatCard title="Last 7 Days" value={dashboardData.stats.symptoms_last_7_days} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Symptom Severity Trends" data={dashboardData?.symptom_trends} />
        <ChartCard title="Most Common Symptoms" data={dashboardData?.common_symptoms} type="bar" />
      </div>
    </div>
  );
}




// Doctor Dashboard Page 
// 🩺 Doctor Dashboard Component with Search & Sort
function DoctorDashboardPage({ user, setCurrentPage, downloadPDF }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ✨ NEW: Search and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [symptomSort, setSymptomSort] = useState('date'); // 'date' or 'severity'

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/auth/patients/');
      setPatients(data);

      // Auto-select first patient if available
      if (data.length > 0 && !selectedPatient) {
        handleSelectPatient(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patientId) => {
    try {
      setDetailsLoading(true);
      setSelectedPatient(patientId);
      const data = await apiCall(`/auth/patients/${patientId}/`);
      setPatientDetails(data);
    } catch (err) {
      console.error('Error fetching patient details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ✨ NEW: Filter patients by search query
  const filteredPatients = patients.filter(patient =>
    patient.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✨ NEW: Sort symptoms
  const getSortedSymptoms = (symptoms) => {
    if (!symptoms) return [];
    const sorted = [...symptoms];
    if (symptomSort === 'severity') {
      return sorted.sort((a, b) => b.severity - a.severity);
    }
    // Default: sort by date (most recent first)
    return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
  };

  const getSeverityLabel = (severity) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      1: '😢',
      2: '😟',
      3: '😐',
      4: '🙂',
      5: '😄'
    };
    return emojis[mood] || '😐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Patients</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor and review patient health data</p>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No patients assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel: Patient List */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3">
                <p className="text-white font-semibold text-sm">
                  Patients ({filteredPatients.length})
                </p>
              </div>

              {/* ✨ NEW: Search Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[calc(100vh-360px)] overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No patients found</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient.id)}
                      className={`w-full text-left px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedPatient === patient.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${selectedPatient === patient.id ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'
                          }`}>
                          {patient.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${selectedPatient === patient.id ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'
                            }`}>
                            {patient.username}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{patient.email}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${selectedPatient === patient.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                          }`} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Patient Details */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : patientDetails ? (
              <div className="space-y-6">
                {/* Patient Info Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {patientDetails.patient.username}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{patientDetails.patient.email}</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                      Read Only
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {patientDetails.patient.phone || '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date of Birth</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {patientDetails.patient.date_of_birth || '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Patient ID</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        #{patientDetails.patient.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Medications */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Active Medications</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({patientDetails.medications.length})
                    </span>
                  </div>

                  {patientDetails.medications.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">No active medications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientDetails.medications.map((med) => (
                        <div key={med.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{med.name}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{med.dosage}</p>
                            </div>
                            <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                              {med.frequency.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3">
                            <span>Started: {med.start_date}</span>
                            {med.end_date && <span>Until: {med.end_date}</span>}
                          </div>
                          {med.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic bg-slate-50 dark:bg-slate-700 p-2 rounded">
                              {med.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Symptoms */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Recent Symptoms</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        (Last 20)
                      </span>
                    </div>

                    {/* ✨ NEW: Sort Toggle */}
                    {patientDetails.recent_symptoms.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSymptomSort('date')}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${symptomSort === 'date'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                          By Date
                        </button>
                        <button
                          onClick={() => setSymptomSort('severity')}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${symptomSort === 'severity'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                          By Severity
                        </button>
                      </div>
                    )}
                  </div>

                  {patientDetails.recent_symptoms.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">No symptoms logged</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getSortedSymptoms(patientDetails.recent_symptoms).map((symptom) => (
                        <div key={symptom.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{symptom.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {new Date(symptom.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              {symptom.notes && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">{symptom.notes}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(symptom.severity)}`}>
                                {getSeverityLabel(symptom.severity)}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {symptom.severity}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mood Logs */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Mood Logs</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      (Last 30 days)
                    </span>
                  </div>

                  {patientDetails.mood_logs.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">No mood logs</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {patientDetails.mood_logs.map((mood) => (
                        <div key={mood.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{mood.mood_display}</span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {mood.notes && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-2">{mood.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



// Medications Page
function MedicationsPage({ user, setCurrentPage }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/medications/');
      setMedications(data);
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      end_date: formData.end_date === '' ? null : formData.end_date,
      notes: formData.notes === '' ? '' : formData.notes,
    };

    try {
      if (editingId) {
        await apiCall(`/medications/${editingId}/`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiCall('/medications/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      fetchMedications();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'once_daily',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
      });
    } catch (err) {
      console.error('Error saving medication:', err.message);
      alert(`Error: ${err.message}`);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medication?')) return;
    try {
      await apiCall(`/medications/${id}/`, { method: 'DELETE' });
      fetchMedications();
    } catch (err) {
      console.error('Error deleting medication:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Medications</h2>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      </div>

      {showForm && (
        <MedicationForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No medications added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med) => (
            <div key={med.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{med.name}</h3>
                <button
                  onClick={() => handleDelete(med.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{med.dosage}</p>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <p>
                  <span className="font-semibold">Frequency:</span> {med.frequency.replace('_', ' ')}
                </p>
                <p>
                  <span className="font-semibold">Start:</span> {med.start_date}
                </p>
                {med.end_date && (
                  <p>
                    <span className="font-semibold">End:</span> {med.end_date}
                  </p>
                )}
              </div>
              {med.notes && <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 italic">{med.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Symptoms Page
function SymptomsPage({ user, setCurrentPage }) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    severity: 5,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/symptoms/');
      setSymptoms(data);
    } catch (err) {
      console.error('Error fetching symptoms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/symptoms/', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      fetchSymptoms();
      setShowForm(false);
      setFormData({
        name: '',
        severity: 5,
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Error saving symptom:', err);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Symptom Log</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Log Symptom
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Symptom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Headache, Nausea"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Severity (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-1">{formData.severity}/10</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Symptom
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : symptoms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No symptoms logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{symptom.name}</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(symptom.severity)}`}>
                      Severity: {symptom.severity}/10
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{symptom.date}</span>
                  </div>
                  {symptom.notes && <p className="text-sm text-slate-600 dark:text-slate-400 italic">{symptom.notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Insights Page
function InsightsPage({ user, setCurrentPage }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/symptoms/ai_insights/');
      setInsights(data);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">AI Health Insights</h2>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : insights?.error ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 inline mr-2" />
          <p className="text-yellow-800 dark:text-yellow-300">{insights.error}</p>
        </div>
      ) : insights?.insight ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8">
          <div className="flex gap-4">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Analysis</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{insights.insight}</p>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  <span className="font-semibold">Period:</span> {insights.analyzed_period}
                </p>
                <p>
                  <span className="font-semibold">Symptoms Analyzed:</span> {insights.symptom_count}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Component: Medication Form
function MedicationForm({ formData, setFormData, onSubmit, onCancel }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Medication Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Aspirin"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dosage *</label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              placeholder="e.g., 500mg"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Frequency *</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="once_daily">Once Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="three_times_daily">Three Times Daily</option>
              <option value="as_needed">As Needed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date *</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions or notes..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Save Medication
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Component: Navigation Card
function NavCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-all text-left group"
    >
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all mb-3">
        {icon}
      </div>
      <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform mt-2" />
    </button>
  );
}

// Component: Stat Card
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  };

  return (
    <div className={`rounded-lg border p-6 ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

// Component: Chart Card

// Register once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Updated ProfilePage with Editable Fields
function ProfilePage({ user, setCurrentPage, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    date_of_birth: user.date_of_birth || '',
    email_digest_enabled: user.email_digest_enabled ?? true,
  });
  const [errors, setErrors] = useState({});

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^\+?[\d\s\-()]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      } else if (age > 150) {
        newErrors.date_of_birth = 'Invalid date of birth';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone || '',
        date_of_birth: formData.date_of_birth || null,
        email_digest_enabled: formData.email_digest_enabled,
      };

      await apiCall('/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      // Update local user state (you might want to refetch profile here)
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);

      // Optional: Trigger a profile refetch in parent component
      // You might want to add a callback prop like onProfileUpdate()
    } catch (err) {
      const errorMessage = err.message;
      try {
        const errorData = JSON.parse(errorMessage);
        if (errorData.username) {
          setErrors({ username: errorData.username[0] });
        } else if (errorData.email) {
          setErrors({ email: errorData.email[0] });
        } else {
          showToast('Failed to update profile', 'error');
        }
      } catch {
        showToast('Failed to update profile', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      date_of_birth: user.date_of_birth || '',
      email_digest_enabled: user.email_digest_enabled ?? true,
    });
    setErrors({});
    setIsEditing(false);
  };

  const nextSunday = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Profile Information</h3>
          {isEditing && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Editing Mode
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Username {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.username
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                    } dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.username}
                  </p>
                )}
              </>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                <p className="font-medium text-slate-900 dark:text-slate-100">{user.username}</p>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email {isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.email
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                    } dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                <p className="font-medium text-slate-900 dark:text-slate-100">{user.email || '—'}</p>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.phone
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                    } dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                <p className="font-medium text-slate-900 dark:text-slate-100">{user.phone || '—'}</p>
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date of Birth
            </label>
            {isEditing ? (
              <>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.date_of_birth
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                    } dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.date_of_birth && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.date_of_birth}
                  </p>
                )}
              </>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {user.date_of_birth
                    ? new Date(user.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    : '—'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Role
            </label>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
              <p className="font-medium text-slate-900 dark:text-slate-100 capitalize flex items-center gap-2">
                {user.role}
                <span className="text-xs text-slate-500 dark:text-slate-400">(Cannot be changed)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Email Preferences (patients only) */}
      {user.role === 'patient' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Email Preferences
          </h3>

          <div className="flex items-start justify-between gap-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Weekly Health Digest</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Receive a weekly summary of your symptoms, mood, medications and AI insights every Sunday.
              </p>
              {formData.email_digest_enabled && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">
                  Next digest: {nextSunday()} at 9:00 AM UTC
                </p>
              )}
            </div>
            <button
              onClick={() => setFormData({ ...formData, email_digest_enabled: !formData.email_digest_enabled })}
              disabled={!isEditing && saving}
              className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${formData.email_digest_enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.email_digest_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {/* Save button for email preferences when not in full edit mode */}
          {!isEditing && formData.email_digest_enabled !== user.email_digest_enabled && (
            <button
              onClick={async () => {
                setSaving(true);
                try {
                  await apiCall('/auth/profile/', {
                    method: 'PATCH',
                    body: JSON.stringify({ email_digest_enabled: formData.email_digest_enabled }),
                  });
                  showToast('Email preferences updated!', 'success');
                } catch (err) {
                  showToast('Failed to update preferences', 'error');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Email Preferences'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, data, type = 'line' }) {
  // Debug (you can remove later)
  console.log(`Chart Data for ${title}:`, data);

  if (!data || !data.labels || !data.datasets) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 h-64 flex items-center justify-center text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>

      <div className="h-64">
        {type === 'bar' ? (
          <Bar data={data} options={options} />
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}

function HistoryPage({ user, setCurrentPage }) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/symptoms/last_seven_days/');
      setSymptoms(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
  };

  const getSeverityLabel = (severity) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  // Group symptoms by date
  const grouped = symptoms.reduce((acc, s) => {
    const d = s.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Recent History</h2>
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-sm">Symptoms logged in the last 7 days</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No symptoms logged in the last 7 days</p>
          <button
            onClick={() => setCurrentPage('symptoms')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Log a Symptom
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, daySymptoms]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {daySymptoms.length} {daySymptoms.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                {/* Symptom cards for this day */}
                <div className="space-y-2 ml-5">
                  {daySymptoms.map(s => (
                    <div key={s.id}
                      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-start justify-between hover:shadow-sm transition-all">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                        {s.notes && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">{s.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(s.severity)}`}>
                          {getSeverityLabel(s.severity)} · {s.severity}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}