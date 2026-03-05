import React, { useState, useEffect, useCallback } from 'react';
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
        {currentPage === 'register' && <RegisterPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'dashboard' && user && (
          <DashboardPage user={user} setCurrentPage={setCurrentPage} downloadPDF={downloadPDF} />  // ← downloadPDF here
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

      </div>
    </div>
  );
}

// Login Page - FIXED
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

      // ⭐ Use API_BASE_URL instead of hardcoded URL
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

      // Handle both response formats
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
// Register Page
function RegisterPage({ setCurrentPage }) {
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