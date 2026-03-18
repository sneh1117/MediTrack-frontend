import React, { useState, useEffect } from 'react';
import {
    Heart, Pill, Activity, CheckCircle, ChevronRight,
    AlertCircle, Loader, Sparkles, ArrowRight, X, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://meditrack.up.railway.app/api';

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
    const [justSaved, setJustSaved] = useState(false);
    
    // ✨ NEW: Real-time validation
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (field, value) => {
        if (field === 'name' && !value.trim()) {
            return 'Medication name is required';
        }
        if (field === 'dosage' && !value.trim()) {
            return 'Dosage is required';
        }
        return '';
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const errorMsg = validateField(field, form[field]);
        setFieldErrors({ ...fieldErrors, [field]: errorMsg });
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
        // Clear field error when user starts typing
        if (touched[field]) {
            const errorMsg = validateField(field, value);
            setFieldErrors({ ...fieldErrors, [field]: errorMsg });
        }
    };

    const handleSubmit = async () => {
        // Validate all fields
        const errors = {
            name: validateField('name', form.name),
            dosage: validateField('dosage', form.dosage),
        };
        
        setFieldErrors(errors);
        setTouched({ name: true, dosage: true });

        if (errors.name || errors.dosage) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await apiCall('/medications/', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            
            // ✨ NEW: Success animation
            setJustSaved(true);
            setTimeout(() => {
                setJustSaved(false);
                onComplete();
            }, 800);
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

    // ✨ NEW: Retry handler
    const handleRetry = () => {
        setError('');
        handleSubmit();
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

            {/* ✨ NEW: Enhanced error display with retry button */}
            {error && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                    {!loading && (
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors flex-shrink-0"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                        </button>
                    )}
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
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="e.g. Aspirin"
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                            touched.name && fieldErrors.name
                                ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                        } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 text-sm transition-colors`}
                    />
                    {touched.name && fieldErrors.name && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.name}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Dosage <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.dosage}
                        onChange={(e) => handleInputChange('dosage', e.target.value)}
                        onBlur={() => handleBlur('dosage')}
                        placeholder="e.g. 500mg"
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                            touched.dosage && fieldErrors.dosage
                                ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                        } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 text-sm transition-colors`}
                    />
                    {touched.dosage && fieldErrors.dosage && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.dosage}
                        </p>
                    )}
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
                {/* ✨ NEW: Success animation state */}
                {justSaved ? (
                    <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow-lg">
                        <CheckCircle className="w-4 h-4" />
                        Saved!
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                )}
                <button
                    onClick={onSkip}
                    disabled={loading || justSaved}
                    className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2 disabled:opacity-50"
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
    const [justSaved, setJustSaved] = useState(false);
    
    // ✨ NEW: Real-time validation
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (field, value) => {
        if (field === 'name' && !value.trim()) {
            return 'Symptom name is required';
        }
        return '';
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        const errorMsg = validateField(field, form[field]);
        setFieldErrors({ ...fieldErrors, [field]: errorMsg });
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
        if (touched[field]) {
            const errorMsg = validateField(field, value);
            setFieldErrors({ ...fieldErrors, [field]: errorMsg });
        }
    };

    const severityLabel = (v) => {
        if (v <= 3) return { text: 'Mild', color: 'text-emerald-600 dark:text-emerald-400' };
        if (v <= 6) return { text: 'Moderate', color: 'text-amber-600 dark:text-amber-400' };
        return { text: 'Severe', color: 'text-red-600 dark:text-red-400' };
    };
    const { text: sevText, color: sevColor } = severityLabel(form.severity);

    const handleSubmit = async () => {
        const errors = {
            name: validateField('name', form.name),
        };
        
        setFieldErrors(errors);
        setTouched({ name: true });

        if (errors.name) {
            setError('Please enter a symptom name');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await apiCall('/symptoms/', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            
            // ✨ NEW: Success animation
            setJustSaved(true);
            setTimeout(() => {
                setJustSaved(false);
                onComplete();
            }, 800);
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

    // ✨ NEW: Retry handler
    const handleRetry = () => {
        setError('');
        handleSubmit();
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

            {/* ✨ NEW: Enhanced error display with retry button */}
            {error && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                    {!loading && (
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors flex-shrink-0"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                        </button>
                    )}
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
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="e.g. Headache, Nausea"
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                            touched.name && fieldErrors.name
                                ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                        } bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 text-sm transition-colors`}
                    />
                    {touched.name && fieldErrors.name && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.name}
                        </p>
                    )}
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
                {/* ✨ NEW: Success animation state */}
                {justSaved ? (
                    <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow-lg">
                        <CheckCircle className="w-4 h-4" />
                        Saved!
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                )}
                <button
                    onClick={onSkip}
                    disabled={loading || justSaved}
                    className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2 disabled:opacity-50"
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

            {/* ✨ NEW: What's Next Preview */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    What's next in your dashboard:
                </p>
                <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>View your medications and set reminder times</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Track symptoms over time with severity charts</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Get AI-powered health insights based on your data</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Export PDF reports to share with your doctor</span>
                    </li>
                </ul>
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

    // ✨ NEW: Analytics tracking
    useEffect(() => {
        console.log('[Onboarding Analytics] Wizard opened for user:', user?.username);
    }, []);

    useEffect(() => {
        console.log('[Onboarding Analytics] Step viewed:', step);
        // Future: send to backend analytics endpoint
        // apiCall('/analytics/onboarding/step-view/', { method: 'POST', body: JSON.stringify({ step, user_id: user?.id }) });
    }, [step]);

    const markDone = (stepIndex) => {
        console.log('[Onboarding Analytics] Step completed:', stepIndex);
        // Future: send completion event
        setCompletedSteps((prev) => [...prev, stepIndex]);
        setStep(stepIndex + 1);
    };

    const skip = (stepIndex) => {
        console.log('[Onboarding Analytics] Step skipped:', stepIndex);
        // Future: send skip event
        setStep(stepIndex + 1);
    };

    const finish = () => {
        console.log('[Onboarding Analytics] Wizard completed. Steps done:', completedSteps);
        // Use username as key — must match shouldShowOnboarding in App.jsx
        localStorage.setItem(`onboarding_complete_${user.username}`, 'true');
        onComplete();
    };

    const steps = [
        { label: 'Medication', icon: <Pill className="w-4 h-4" /> },
        { label: 'Symptom', icon: <Activity className="w-4 h-4" /> },
        { label: 'Done', icon: <CheckCircle className="w-4 h-4" /> },
    ];

    return (
        // Full-screen overlay — scrollable on small screens
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg mx-auto my-4 px-3 sm:px-4 sm:my-0">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Heart className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-bold text-base sm:text-lg truncate">Welcome to MediTrack!</span>
                            </div>
                            {step < 2 && (
                                <button
                                    onClick={finish}
                                    className="text-white/60 hover:text-white transition-colors p-1 rounded flex-shrink-0 ml-2"
                                    title="Skip setup"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-blue-100 text-xs sm:text-sm pl-9 sm:pl-10">
                            Hi {user?.username} 👋 — let's get you set up in 2 quick steps
                        </p>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center px-4 sm:px-8 py-3 sm:py-5 border-b border-slate-100 dark:border-slate-700">
                        {steps.map((s, i) => (
                            <React.Fragment key={i}>
                                <StepDot index={i} currentStep={step} label={s.label} icon={s.icon} />
                                {i < steps.length - 1 && <StepConnector done={i < step} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step content */}
                    <div className="px-4 sm:px-6 py-4 sm:py-6">
                        {step === 0 && <StepMedication onComplete={() => markDone(0)} onSkip={() => skip(0)} />}
                        {step === 1 && <StepSymptom onComplete={() => markDone(1)} onSkip={() => skip(1)} />}
                        {step === 2 && <StepDone completedSteps={completedSteps} onFinish={finish} />}
                    </div>

                    {/* Footer progress */}
                    {step < 2 && (
                        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
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
        </div>
    );
}