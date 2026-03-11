import React, { useState } from 'react';
import {
  Heart, Pill, Activity, CheckCircle, ChevronRight,
  AlertCircle, Loader, Sparkles, ArrowRight, X
} from 'lucide-react';

const API_BASE_URL = 'https://meditrack.up.railway.app/api';//'http://localhost:8000/api'; //'https://meditrack.up.railway.app/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }
  // DELETE returns 204 No Content
  if (response.status === 204) return null;
  return response.json();
};

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ index, currentStep, label, icon }) {
  const done = index < currentStep;
  const active = index === currentStep;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
          transition-all duration-300
          ${done
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40'
            : active
            ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50 scale-110'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
          }`}
      >
        {done ? <CheckCircle className="w-5 h-5" /> : icon}
      </div>
      <span
        className={`text-xs font-medium whitespace-nowrap transition-colors
          ${active ? 'text-blue-600 dark:text-blue-400' : done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ done }) {
  return (
    <div className="flex-1 h-0.5 mt-5 mx-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
      <div
        className={`h-full rounded-full transition-all duration-500
          ${done ? 'w-full bg-gradient-to-r from-emerald-400 to-teal-400' : 'w-0'}`}
      />
    </div>
  );
}

// ─── Step 1: Add First Medication ─────────────────────────────────────────────
function StepMedication({ onComplete, onSkip }) {
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.dosage.trim()) {
      setError('Medication name and dosage are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiCall('/medications/', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onComplete();
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        const first = Object.values(parsed)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } catch {
        setError('Failed to save medication. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Add your first medication</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">You can add more later from the Medications page</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Medication Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Aspirin"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Dosage <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            placeholder="e.g. 500mg"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Frequency</label>
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="once_daily">Once Daily</option>
            <option value="twice_daily">Twice Daily</option>
            <option value="three_times_daily">Three Times Daily</option>
            <option value="as_needed">As Needed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any special instructions..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Log First Symptom ─────────────────────────────────────────────────
function StepSymptom({ onComplete, onSkip }) {
  const [form, setForm] = useState({
    name: '',
    severity: 5,
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const severityLabel = (v) => {
    if (v <= 3) return { text: 'Mild', color: 'text-emerald-600 dark:text-emerald-400' };
    if (v <= 6) return { text: 'Moderate', color: 'text-amber-600 dark:text-amber-400' };
    return { text: 'Severe', color: 'text-red-600 dark:text-red-400' };
  };
  const { text: sevText, color: sevColor } = severityLabel(form.severity);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Please enter a symptom name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiCall('/symptoms/', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onComplete();
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        const first = Object.values(parsed)[0];
        setError(Array.isArray(first) ? first[0] : String(first));
      } catch {
        setError('Failed to save symptom. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
          <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Log your first symptom</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track how you're feeling today to get AI insights</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Symptom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Headache, Nausea"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
          <input
            type="date"
            value={form.date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Severity
          </label>
          <span className={`text-sm font-semibold ${sevColor}`}>
            {form.severity}/10 — {sevText}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: parseInt(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
          <span>1 · Mild</span>
          <span>10 · Severe</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="When did it start? Any triggers?"
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Done ──────────────────────────────────────────────────────────────
function StepDone({ completedSteps, onFinish }) {
  const addedMed = completedSteps.includes(0);
  const addedSymptom = completedSteps.includes(1);

  return (
    <div className="text-center space-y-6 py-4">
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-emerald-900/50">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">You're all set!</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-sm mx-auto">
          MediTrack is ready to help you manage your health. Here's what you've done:
        </p>
      </div>

      <div className="flex flex-col gap-2.5 max-w-xs mx-auto text-left">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium
          ${addedMed
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through'
          }`}>
          <Pill className="w-4 h-4 flex-shrink-0" />
          {addedMed ? '✓ First medication added' : 'Medication skipped'}
        </div>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium
          ${addedSymptom
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through'
          }`}>
          <Activity className="w-4 h-4 flex-shrink-0" />
          {addedSymptom ? '✓ First symptom logged' : 'Symptom skipped'}
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-sm font-medium">
          <Heart className="w-4 h-4 flex-shrink-0" />
          ✓ Account created
        </div>
      </div>

      <button
        onClick={onFinish}
        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-200 dark:hover:shadow-blue-900/50 transition-all text-sm"
      >
        Go to Dashboard
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Wizard ───────────────────────────────────────────────────────────────
export default function OnboardingWizard({ user, onComplete }) {
  const [step, setStep] = useState(0); // 0=medication, 1=symptom, 2=done
  const [completedSteps, setCompletedSteps] = useState([]);

  const markDone = (stepIndex) => {
    setCompletedSteps((prev) => [...prev, stepIndex]);
    setStep(stepIndex + 1);
  };

  const skip = (stepIndex) => {
    setStep(stepIndex + 1);
  };

  const finish = () => {
    // Mark onboarding as done in localStorage so it never shows again
    localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
    onComplete();
  };

  const steps = [
    { label: 'Medication', icon: <Pill className="w-4 h-4" /> },
    { label: 'Symptom', icon: <Activity className="w-4 h-4" /> },
    { label: 'Done', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    // Full-screen overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Welcome to MediTrack!</span>
            </div>
            {step < 2 && (
              <button
                onClick={finish}
                className="text-white/60 hover:text-white transition-colors p-1 rounded"
                title="Skip setup"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-blue-100 text-sm pl-10.5">
            Hi {user?.username} 👋 — let's get you set up in 2 quick steps
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-start px-8 py-5 border-b border-slate-100 dark:border-slate-700">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <StepDot
                index={i}
                currentStep={step}
                label={s.label}
                icon={s.icon}
              />
              {i < steps.length - 1 && (
                <StepConnector done={i < step} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 py-6">
          {step === 0 && (
            <StepMedication
              onComplete={() => markDone(0)}
              onSkip={() => skip(0)}
            />
          )}
          {step === 1 && (
            <StepSymptom
              onComplete={() => markDone(1)}
              onSkip={() => skip(1)}
            />
          )}
          {step === 2 && (
            <StepDone
              completedSteps={completedSteps}
              onFinish={finish}
            />
          )}
        </div>

        {/* Footer progress */}
        {step < 2 && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1.5">
              <span>Step {step + 1} of 2</span>
              <span>{step === 0 ? '0%' : '50%'} complete</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: step === 0 ? '0%' : '50%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
