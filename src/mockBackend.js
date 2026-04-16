// mockBackend.js — Drop this file into your src/ folder
// It intercepts all API calls when DEMO MODE is active
// and returns realistic fake data stored in localStorage

const DEMO_USER = {
  id: 999,
  username: 'demo_user',
  email: 'demo@meditrack.com',
  role: 'patient',
  phone: '+91 98765 43210',
  date_of_birth: '1995-06-15',
  email_digest_enabled: true,
  first_name: 'Demo',
  last_name: 'User',
};

const DEMO_MEDICATIONS = [
  { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'twice_daily', start_date: '2024-11-01', end_date: null, notes: 'Take with meals', is_active: true },
  { id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'once_daily', start_date: '2024-10-15', end_date: null, notes: 'Blood pressure medication', is_active: true },
  { id: 3, name: 'Vitamin D3', dosage: '1000 IU', frequency: 'once_daily', start_date: '2024-09-01', end_date: null, notes: 'Take with breakfast', is_active: true },
  { id: 4, name: 'Aspirin', dosage: '81mg', frequency: 'once_daily', start_date: '2024-08-01', end_date: '2025-01-01', notes: 'Low dose for heart health', is_active: false },
];

const DEMO_SYMPTOMS = [
  { id: 1, name: 'Headache', severity: 6, date: daysAgo(0), notes: 'Mild tension headache in the afternoon', medication: null },
  { id: 2, name: 'Fatigue', severity: 5, date: daysAgo(1), notes: 'Felt tired after lunch', medication: null },
  { id: 3, name: 'Dizziness', severity: 4, date: daysAgo(2), notes: 'Brief episode, resolved quickly', medication: 2 },
  { id: 4, name: 'Nausea', severity: 3, date: daysAgo(3), notes: 'Slight nausea after taking Metformin', medication: 1 },
  { id: 5, name: 'Joint Pain', severity: 7, date: daysAgo(4), notes: 'Left knee, worse in the morning', medication: null },
  { id: 6, name: 'Headache', severity: 4, date: daysAgo(5), notes: 'Mild, resolved after water intake', medication: null },
  { id: 7, name: 'Fatigue', severity: 6, date: daysAgo(6), notes: 'Low energy throughout the day', medication: null },
  { id: 8, name: 'Stomach Ache', severity: 5, date: daysAgo(8), notes: 'After dinner', medication: 1 },
  { id: 9, name: 'Back Pain', severity: 4, date: daysAgo(10), notes: 'Lower back, after long sitting', medication: null },
  { id: 10, name: 'Insomnia', severity: 5, date: daysAgo(12), notes: 'Difficulty falling asleep', medication: null },
];

const DEMO_MOODS = [
  { id: 1, mood: 4, mood_display: 'Good', date: daysAgo(0), notes: 'Productive day overall' },
  { id: 2, mood: 3, mood_display: 'Neutral', date: daysAgo(1), notes: 'A bit tired but okay' },
  { id: 3, mood: 5, mood_display: 'Great', date: daysAgo(2), notes: 'Felt very energetic today' },
  { id: 4, mood: 2, mood_display: 'Low', date: daysAgo(3), notes: 'Headache made it a rough day' },
  { id: 5, mood: 4, mood_display: 'Good', date: daysAgo(4), notes: 'Good workout, feeling better' },
  { id: 6, mood: 3, mood_display: 'Neutral', date: daysAgo(5), notes: '' },
  { id: 7, mood: 4, mood_display: 'Good', date: daysAgo(6), notes: 'Nice weather, good mood' },
];

const DEMO_DASHBOARD = {
  stats: {
    active_medications: 3,
    total_symptoms_logged: 10,
    symptoms_last_7_days: 7,
  },
  symptom_trends: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Avg Severity',
      data: [4, 6, 5, 3, 7, 4, 5],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4,
    }],
  },
  common_symptoms: {
    labels: ['Headache', 'Fatigue', 'Joint Pain', 'Nausea', 'Dizziness'],
    datasets: [{
      label: 'Occurrences',
      data: [3, 2, 1, 1, 1],
      backgroundColor: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'],
    }],
  },
};

const DEMO_INSIGHTS = {
  insight: `Based on your last 7 days of health data, here are some key observations:\n\n📊 **Pattern Analysis:**\nYou've logged 7 symptoms this week, with headaches and fatigue being the most frequent. Both tend to appear in the afternoon, which may suggest dehydration or eye strain from prolonged screen time.\n\n💊 **Medication Correlation:**\nMild nausea appears to correlate with Metformin doses. This is a known side effect — taking the medication with a fuller meal may help reduce this.\n\n😴 **Sleep & Mood:**\nOn days when you logged insomnia, your mood score was notably lower the following day. Prioritising 7-8 hours of sleep could positively impact your energy and pain levels.\n\n✅ **Recommendations:**\n• Drink at least 2L of water daily — may reduce headache frequency\n• Take Metformin with a substantial meal, not just a snack\n• Consider a brief walk after lunch to help with afternoon fatigue\n\n⚠️ MediTrack AI provides observations only — it does not diagnose medical conditions. Consult your doctor for medical advice.`,
  analyzed_period: 'Last 7 days',
  symptom_count: 7,
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// --- localStorage-backed state so CRUD actually works in demo ---
function getState(key, fallback) {
  try {
    const raw = localStorage.getItem('demo_' + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function setState(key, value) {
  localStorage.setItem('demo_' + key, JSON.stringify(value));
  return value;
}

function nextId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1;
}

// --- Route handler ---
export function mockApiCall(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;

  // Auth
  if (endpoint === '/auth/profile/' && method === 'GET') {
    return ok(getState('user', DEMO_USER));
  }
  if (endpoint === '/auth/profile/' && (method === 'PATCH' || method === 'PUT')) {
    const current = getState('user', DEMO_USER);
    const updated = { ...current, ...body };
    setState('user', updated);
    return ok(updated);
  }

  // Dashboard
  if (endpoint === '/dashboard/' || endpoint.startsWith('/dashboard/?')) {
    const meds = getState('medications', DEMO_MEDICATIONS);
    const symptoms = getState('symptoms', DEMO_SYMPTOMS);
    const active = meds.filter(m => m.is_active);
    const last7 = symptoms.filter(s => {
      const d = new Date(s.date);
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      return d >= cutoff;
    });

    // Build real chart data from actual stored symptoms
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const labels = Array.from({length:7}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate()-6+i);
      return days[d.getDay()];
    });
    const severityByDay = Array.from({length:7}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate()-6+i);
      const dateStr = d.toISOString().split('T')[0];
      const daySx = symptoms.filter(s => s.date === dateStr);
      return daySx.length ? Math.round(daySx.reduce((a,s) => a+s.severity, 0)/daySx.length) : 0;
    });

    const nameCounts = {};
    symptoms.forEach(s => { nameCounts[s.name] = (nameCounts[s.name]||0)+1; });
    const topNames = Object.entries(nameCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

    return ok({
      stats: {
        active_medications: active.length,
        total_symptoms_logged: symptoms.length,
        symptoms_last_7_days: last7.length,
      },
      symptom_trends: {
        labels,
        datasets: [{
          label: 'Avg Severity',
          data: severityByDay,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.4,
        }],
      },
      common_symptoms: {
        labels: topNames.map(([name]) => name),
        datasets: [{
          label: 'Occurrences',
          data: topNames.map(([,count]) => count),
          backgroundColor: ['#3b82f6','#06b6d4','#8b5cf6','#f59e0b','#10b981'],
        }],
      },
    });
  }

  // Medications
  if (endpoint === '/medications/' && method === 'GET') {
    return ok(getState('medications', DEMO_MEDICATIONS));
  }
  if (endpoint === '/medications/' && method === 'POST') {
    const meds = getState('medications', DEMO_MEDICATIONS);
    const newMed = { ...body, id: nextId(meds), is_active: true };
    setState('medications', [...meds, newMed]);
    return ok(newMed);
  }
  if (endpoint.match(/\/medications\/\d+\/$/) && method === 'PUT') {
    const id = parseInt(endpoint.split('/').filter(Boolean).pop());
    const meds = getState('medications', DEMO_MEDICATIONS);
    const updated = meds.map(m => m.id === id ? { ...m, ...body } : m);
    setState('medications', updated);
    return ok(updated.find(m => m.id === id));
  }
  if (endpoint.match(/\/medications\/\d+\/$/) && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').filter(Boolean).pop());
    const meds = getState('medications', DEMO_MEDICATIONS);
    setState('medications', meds.filter(m => m.id !== id));
    return okEmpty();
  }
  if (endpoint === '/medications/current/' || endpoint.startsWith('/medications/current/?')) {
    const meds = getState('medications', DEMO_MEDICATIONS);
    return ok(meds.filter(m => m.is_active));
  }
  if (endpoint === '/medications/upcoming/' || endpoint.startsWith('/medications/upcoming/?')) {
    return ok([]);
  }
  if (endpoint === '/medications/adherence/' || endpoint.startsWith('/medications/adherence/?')) {
    return ok({ adherence_rate: 87, reminders_sent: 42, reminders_taken: 37 });
  }

  // Symptoms
  if (endpoint === '/symptoms/' && method === 'GET') {
    return ok(getState('symptoms', DEMO_SYMPTOMS));
  }
  if (endpoint === '/symptoms/' && method === 'POST') {
    const symptoms = getState('symptoms', DEMO_SYMPTOMS);
    const newSx = { ...body, id: nextId(symptoms), medication: null };
    setState('symptoms', [newSx, ...symptoms]);
    return ok(newSx);
  }
  if (endpoint.match(/\/symptoms\/\d+\/$/) && method === 'DELETE') {
    const id = parseInt(endpoint.split('/').filter(Boolean).pop());
    const symptoms = getState('symptoms', DEMO_SYMPTOMS);
    setState('symptoms', symptoms.filter(s => s.id !== id));
    return okEmpty();
  }
  if (endpoint.startsWith('/symptoms/last_seven_days/')) {
    const symptoms = getState('symptoms', DEMO_SYMPTOMS);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return ok(symptoms.filter(s => new Date(s.date) >= cutoff));
  }
  if (endpoint.startsWith('/symptoms/summary/')) {
    const symptoms = getState('symptoms', DEMO_SYMPTOMS);
    return ok({ count: symptoms.length, avg_severity: 5.1, most_common: 'Headache' });
  }
  if (endpoint.startsWith('/symptoms/ai_insights/')) {
    return ok(DEMO_INSIGHTS);
  }

  // Moods
  if (endpoint === '/moods/' && method === 'GET') {
    return ok(getState('moods', DEMO_MOODS));
  }
  if (endpoint === '/moods/' && method === 'POST') {
    const moods = getState('moods', DEMO_MOODS);
    const moodLabels = { 1:'Very Low', 2:'Low', 3:'Neutral', 4:'Good', 5:'Great' };
    const newMood = { ...body, id: nextId(moods), mood_display: moodLabels[body.mood] || 'Neutral' };
    setState('moods', [newMood, ...moods]);
    return ok(newMood);
  }
  if (endpoint.startsWith('/moods/trends/')) {
    return ok({ labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label:'Mood', data:[4,3,5,2,4,3,4], borderColor:'#8b5cf6', tension:0.4 }] });
  }

  // Reports — return a simple text blob since we can't generate real PDFs
  if (endpoint.startsWith('/reports/export/')) {
    return ok({ message: 'PDF export is not available in demo mode.' });
  }

  // Fallback
  console.warn('[MockBackend] Unhandled:', method, endpoint);
  return ok({});
}

function ok(data) {
  return Promise.resolve(data);
}

function okEmpty() {
  return Promise.resolve(null);
}