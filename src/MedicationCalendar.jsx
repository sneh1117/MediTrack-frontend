import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle, X, ChevronLeft, ChevronRight, Pill } from 'lucide-react';

// API Base URL - matches your App.jsx
const API_BASE_URL = 'https://meditrack.up.railway.app/api';

export default function MedicationCalendar({ user, setCurrentPage }) {
  const [medications, setMedications] = useState([]);
  const [adherenceLogs, setAdherenceLogs] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchMedications();
    loadAdherenceLogs();
  }, []);

  // Fetch active medications from API
  const fetchMedications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/medications/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMedications(data);
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load adherence logs from localStorage
  const loadAdherenceLogs = () => {
    const stored = localStorage.getItem(`adherence_logs_${user.username}`);
    if (stored) {
      setAdherenceLogs(JSON.parse(stored));
    }
  };

  // Save adherence logs to localStorage
  const saveAdherenceLogs = (logs) => {
    localStorage.setItem(`adherence_logs_${user.username}`, JSON.stringify(logs));
    setAdherenceLogs(logs);
  };

  // Get medications active on a specific date
  const getMedicationsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return medications.filter(med => {
      const startDate = new Date(med.start_date + 'T00:00:00');
      const endDate = med.end_date ? new Date(med.end_date + 'T00:00:00') : null;
      
      return date >= startDate && (!endDate || date <= endDate);
    });
  };

  // Get adherence status for a date
  const getAdherenceStatus = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const activeMeds = getMedicationsForDate(date);
    const log = adherenceLogs[dateStr];

    if (activeMeds.length === 0) return 'none';
    if (!log) return 'no-data';

    const takenCount = log.medication_ids.length;
    const totalCount = activeMeds.length;

    if (takenCount === 0) return 'red';
    if (takenCount === totalCount) return 'green';
    return 'yellow';
  };

  // Get color class based on adherence status
  const getColorClass = (status) => {
    const colors = {
      'green': 'bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-700',
      'yellow': 'bg-yellow-400 dark:bg-yellow-500 border-yellow-500 dark:border-yellow-600',
      'red': 'bg-red-400 dark:bg-red-500 border-red-500 dark:border-red-600',
      'no-data': 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
      'none': 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700',
    };
    return colors[status] || colors['no-data'];
  };

  // Generate calendar days for last 30 days
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  // Handle day click
  const handleDayClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow logging for future dates
    if (date > today) return;

    const activeMeds = getMedicationsForDate(date);
    if (activeMeds.length === 0) return;

    setSelectedDate(date);
  };

  // Handle saving adherence for selected date
  const handleSaveAdherence = (takenMedIds) => {
    setModalLoading(true);
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const activeMeds = getMedicationsForDate(selectedDate);
    
    const newLogs = {
      ...adherenceLogs,
      [dateStr]: {
        medication_ids: takenMedIds,
        total_active: activeMeds.length,
        logged_at: new Date().toISOString(),
      }
    };
    
    saveAdherenceLogs(newLogs);
    
    setTimeout(() => {
      setModalLoading(false);
      setSelectedDate(null);
    }, 300);
  };

  const calendarDays = generateCalendarDays();

  // Calculate stats
  const totalDays = calendarDays.filter(d => getMedicationsForDate(d).length > 0).length;
  const greenDays = calendarDays.filter(d => getAdherenceStatus(d) === 'green').length;
  const adherenceRate = totalDays > 0 ? Math.round((greenDays / totalDays) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-900 dark:text-slate-100"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Medication Calendar</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily medication adherence</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <Pill className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-500 dark:text-slate-400">Loading medications...</p>
          </div>
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No active medications to track</p>
          <button
            onClick={() => setCurrentPage('medications')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            Add Your First Medication
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Adherence Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{adherenceRate}%</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Last 30 days</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  adherenceRate >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  adherenceRate >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Perfect Days</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{greenDays}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All meds taken</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Active Medications</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{medications.length}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Currently tracking</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Legend</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-700"></div>
                <span className="text-slate-600 dark:text-slate-400">All medications taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-400 dark:bg-yellow-500 border border-yellow-500 dark:border-yellow-600"></div>
                <span className="text-slate-600 dark:text-slate-400">Partially taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-400 dark:bg-red-500 border border-red-500 dark:border-red-600"></div>
                <span className="text-slate-600 dark:text-slate-400">No medications taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"></div>
                <span className="text-slate-600 dark:text-slate-400">Not logged yet</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Last 30 Days
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Click any day to log medications taken
              </p>
            </div>

            {/* Calendar Grid - 7 columns for weeks */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day labels */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 pb-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for alignment */}
              {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Calendar days */}
              {calendarDays.map((date, idx) => {
                const status = getAdherenceStatus(date);
                const activeMeds = getMedicationsForDate(date);
                const dateStr = date.toISOString().split('T')[0];
                const log = adherenceLogs[dateStr];
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isFuture = date > today;
                const isToday = date.getTime() === today.getTime();

                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(date)}
                    disabled={isFuture || activeMeds.length === 0}
                    className={`
                      aspect-square rounded-lg border-2 transition-all relative group
                      ${getColorClass(status)}
                      ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}
                      ${activeMeds.length === 0 ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-md cursor-pointer'}
                      ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-slate-800' : ''}
                    `}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-xs font-semibold ${
                        status === 'green' || status === 'yellow' || status === 'red'
                          ? 'text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {date.getDate()}
                      </span>
                      {log && activeMeds.length > 0 && (
                        <span className="text-[10px] text-white font-medium mt-0.5">
                          {log.medication_ids.length}/{activeMeds.length}
                        </span>
                      )}
                    </div>

                    {/* Tooltip */}
                    {!isFuture && activeMeds.length > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                          <p className="font-semibold">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          {log ? (
                            <p className="mt-1">
                              {log.medication_ids.length}/{activeMeds.length} medications taken
                            </p>
                          ) : (
                            <p className="mt-1 text-slate-300">Click to log</p>
                          )}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal for logging medications */}
      {selectedDate && (
        <AdherenceModal
          date={selectedDate}
          medications={getMedicationsForDate(selectedDate)}
          existingLog={adherenceLogs[selectedDate.toISOString().split('T')[0]]}
          onSave={handleSaveAdherence}
          onClose={() => setSelectedDate(null)}
          loading={modalLoading}
        />
      )}
    </div>
  );
}

// Modal Component for logging medications
function AdherenceModal({ date, medications, existingLog, onSave, onClose, loading }) {
  const [selectedMeds, setSelectedMeds] = useState(
    existingLog ? existingLog.medication_ids : []
  );

  const toggleMedication = (medId) => {
    if (selectedMeds.includes(medId)) {
      setSelectedMeds(selectedMeds.filter(id => id !== medId));
    } else {
      setSelectedMeds([...selectedMeds, medId]);
    }
  };

  const handleSave = () => {
    onSave(selectedMeds);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Log Medications</h3>
            <p className="text-blue-100 text-sm">
              {date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select the medications you took on this day:
          </p>

          <div className="space-y-3">
            {medications.map((med) => {
              const isChecked = selectedMeds.includes(med.id);
              
              return (
                <button
                  key={med.id}
                  onClick={() => toggleMedication(med.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isChecked
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      {isChecked ? (
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {med.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {med.dosage} • {med.frequency.replace(/_/g, ' ')}
                      </p>
                      {med.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                          {med.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-slate-100 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save ({selectedMeds.length}/{medications.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}