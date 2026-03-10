import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google'

import {
  Heart, LogOut, Plus, Trash2, Eye, EyeOff, ChevronRight,
  AlertCircle, CheckCircle, Clock, TrendingUp, Brain, Activity,
  Calendar, Pill, MessageSquare, Loader, Download, Settings, Bell
} from 'lucide-react';
import LandingPage from './LandingPage';
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
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    loading: 'bg-blue-50 border-blue-200 text-blue-800',
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





// Main App - FIXED
export default function MediTrackApp() {

  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

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

      // ⭐ Use API_BASE_URL instead of hardcoded URL
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}





      {/* Navigation Bar */}
      {user && (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
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
                <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>

              {/* Settings link */}
              <button
                onClick={() => setCurrentPage('profile')}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Manage your health with MediTrack</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your username"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
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
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 absolute">or</span>
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

          <p className="text-center text-slate-600 text-sm mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentPage('register')}
              className="text-blue-600 font-semibold hover:text-blue-700"
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
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-6">Start managing your health today</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 absolute">or</span>
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

          <p className="text-center text-slate-600 text-sm mt-6">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentPage('login')}
              className="text-blue-600 font-semibold hover:text-blue-700"
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Almost there!</h2>
          <p className="text-slate-500 mt-2">
            Signing in as <strong>{pending.email}</strong>
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Just pick a username to finish setting up your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Choose a Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sneha_health"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              I am a
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-4
          flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              Export Health Report
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download a PDF summary of your medications, symptoms, mood and AI insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDays(d)}
                  className={`px-3 py-1.5 font-medium transition-colors ${selectedDays === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
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
    if (severity <= 3) return 'bg-green-100 text-green-800 border-green-200';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
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
        <h2 className="text-3xl font-bold text-slate-900">My Patients</h2>
        <p className="text-slate-500 mt-1">Monitor and review patient health data</p>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No patients assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel: Patient List */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3">
                <p className="text-white font-semibold text-sm">
                  Patients ({filteredPatients.length})
                </p>
              </div>
              
              {/* ✨ NEW: Search Bar */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="divide-y divide-slate-200 max-h-[calc(100vh-360px)] overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-slate-500 text-sm">No patients found</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient.id)}
                      className={`w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors ${
                        selectedPatient === patient.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          selectedPatient === patient.id ? 'bg-blue-600' : 'bg-slate-400'
                        }`}>
                          {patient.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${
                            selectedPatient === patient.id ? 'text-blue-900' : 'text-slate-900'
                          }`}>
                            {patient.username}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{patient.email}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                          selectedPatient === patient.id ? 'text-blue-600' : 'text-slate-400'
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
              <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : patientDetails ? (
              <div className="space-y-6">
                {/* Patient Info Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {patientDetails.patient.username}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">{patientDetails.patient.email}</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      Read Only
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Phone</p>
                      <p className="font-medium text-slate-900">
                        {patientDetails.patient.phone || '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                      <p className="font-medium text-slate-900">
                        {patientDetails.patient.date_of_birth || '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Patient ID</p>
                      <p className="font-medium text-slate-900">
                        #{patientDetails.patient.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Medications */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Pill className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-900">Active Medications</h4>
                    <span className="text-xs text-slate-500">
                      ({patientDetails.medications.length})
                    </span>
                  </div>
                  
                  {patientDetails.medications.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg">
                      <p className="text-slate-500 text-sm">No active medications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientDetails.medications.map((med) => (
                        <div key={med.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{med.name}</p>
                              <p className="text-sm text-slate-600">{med.dosage}</p>
                            </div>
                            <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {med.frequency.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                            <span>Started: {med.start_date}</span>
                            {med.end_date && <span>Until: {med.end_date}</span>}
                          </div>
                          {med.notes && (
                            <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2 rounded">
                              {med.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Symptoms */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-slate-900">Recent Symptoms</h4>
                      <span className="text-xs text-slate-500">
                        (Last 20)
                      </span>
                    </div>
                    
                    {/* ✨ NEW: Sort Toggle */}
                    {patientDetails.recent_symptoms.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSymptomSort('date')}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            symptomSort === 'date'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          By Date
                        </button>
                        <button
                          onClick={() => setSymptomSort('severity')}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            symptomSort === 'severity'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          By Severity
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {patientDetails.recent_symptoms.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg">
                      <p className="text-slate-500 text-sm">No symptoms logged</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getSortedSymptoms(patientDetails.recent_symptoms).map((symptom) => (
                        <div key={symptom.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{symptom.name}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(symptom.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              {symptom.notes && (
                                <p className="text-sm text-slate-600 mt-2 italic">{symptom.notes}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(symptom.severity)}`}>
                                {getSeverityLabel(symptom.severity)}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
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
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-slate-900">Mood Logs</h4>
                    <span className="text-xs text-slate-500">
                      (Last 30 days)
                    </span>
                  </div>
                  
                  {patientDetails.mood_logs.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg">
                      <p className="text-slate-500 text-sm">No mood logs</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {patientDetails.mood_logs.map((mood) => (
                        <div key={mood.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getMoodEmoji(mood.mood)}</span>
                              <span className="font-semibold text-slate-900">{mood.mood_display}</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {mood.notes && (
                            <p className="text-sm text-slate-600 italic mt-2">{mood.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500">Select a patient to view details</p>
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
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-slate-900">My Medications</h2>
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
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No medications added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med) => (
            <div key={med.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-slate-900">{med.name}</h3>
                <button
                  onClick={() => handleDelete(med.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-2">{med.dosage}</p>
              <div className="space-y-2 text-xs text-slate-500">
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
              {med.notes && <p className="text-xs text-slate-600 mt-3 italic">{med.notes}</p>}
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
    if (severity <= 3) return 'bg-green-100 text-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-slate-900">Symptom Log</h2>
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
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Symptom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Headache, Nausea"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Severity (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-center text-sm text-slate-600 mt-1">{formData.severity}/10</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
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
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No symptoms logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{symptom.name}</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(symptom.severity)}`}>
                      Severity: {symptom.severity}/10
                    </span>
                    <span className="text-xs text-slate-500">{symptom.date}</span>
                  </div>
                  {symptom.notes && <p className="text-sm text-slate-600 italic">{symptom.notes}</p>}
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
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-900">AI Health Insights</h2>
        <button
          onClick={fetchInsights}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : insights?.error ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <AlertCircle className="w-5 h-5 text-yellow-600 inline mr-2" />
          <p className="text-yellow-800">{insights.error}</p>
        </div>
      ) : insights?.insight ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-8">
          <div className="flex gap-4">
            <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Analysis</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{insights.insight}</p>
              <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-slate-600">
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
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Medication Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Aspirin"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dosage *</label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              placeholder="e.g., 500mg"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Frequency *</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="once_daily">Once Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="three_times_daily">Three Times Daily</option>
              <option value="as_needed">As Needed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions or notes..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
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
      className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-lg transition-all text-left group"
    >
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all mb-3">
        {icon}
      </div>
      <p className="font-semibold text-slate-900">{label}</p>
      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform mt-2" />
    </button>
  );
}

// Component: Stat Card
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
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

function ProfilePage({ user, setCurrentPage, showToast }) {
  const [digestEnabled, setDigestEnabled] = useState(user.email_digest_enabled ?? true);
  const [saving, setSaving] = useState(false);

  const savePreferences = async () => {
    setSaving(true);
    try {
      await apiCall('/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify({ email_digest_enabled: digestEnabled }),

      });
      showToast('Preferences saved!', 'success');
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculate next Sunday
  const nextSunday = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-lg">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Username', value: user.username },
            { label: 'Email', value: user.email || '—' },
            { label: 'Role', value: user.role },
            { label: 'Phone', value: user.phone || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="font-medium text-slate-900 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Preferences — patients only */}
      {user.role === 'patient' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Email Preferences
          </h3>

          <div className="flex items-start justify-between gap-6 p-4 
            bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Weekly Health Digest</p>
              <p className="text-sm text-slate-500 mt-1">
                Receive a weekly summary of your symptoms, mood, medications and AI insights every Sunday.
              </p>
              {digestEnabled && (
                <p className="text-xs text-blue-600 font-medium mt-2">
                  Next digest: {nextSunday()} at 9:00 AM UTC
                </p>
              )}
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setDigestEnabled(!digestEnabled)}
              className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${digestEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full 
                shadow transition-transform ${digestEnabled ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 
              text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
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
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
        <div className="bg-slate-50 rounded-lg p-4 h-64 flex items-center justify-center text-slate-400">
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
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>

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
    if (severity <= 3) return 'bg-green-100 text-green-800 border-green-200';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
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
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-900">Recent History</h2>
      </div>

      <p className="text-slate-500 text-sm">Symptoms logged in the last 7 days</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No symptoms logged in the last 7 days</p>
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
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">
                    {daySymptoms.length} {daySymptoms.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                {/* Symptom cards for this day */}
                <div className="space-y-2 ml-5">
                  {daySymptoms.map(s => (
                    <div key={s.id}
                      className="bg-white rounded-lg border border-slate-200 p-4 flex items-start justify-between hover:shadow-sm transition-all">
                      <div>
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        {s.notes && <p className="text-sm text-slate-500 mt-1 italic">{s.notes}</p>}
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