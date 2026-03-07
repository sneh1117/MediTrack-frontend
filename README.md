# MediTrack Frontend

A React dashboard for managing medications, tracking symptoms, logging mood, exporting health reports, and getting AI-powered health insights.

**Live App:** https://meditrack7.vercel.app  
**Backend API:** https://meditrack.up.railway.app  
**API Docs:** https://meditrack.up.railway.app/api/docs/

---

## 🚀 Features

- User registration & login with JWT authentication
- Add, edit, and manage medications with frequency scheduling
- Log and track daily symptoms with severity ratings (1-10)
- Mood logging (1-5 scale) with trend tracking
- AI health insights powered by Google Gemini
- PDF health report export (7, 30, or 90 day range)
- Weekly email digest toggle in profile settings
- Interactive symptom trend and common symptoms charts
- 7-day symptom history timeline
- Settings page with profile info and email preferences
- Toast notifications for all actions
- Responsive design — works on mobile and desktop
- Doctor and patient role support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 📦 Quick Start

**Prerequisites:** Node.js v16+, npm v8+

```bash
# Clone repo
git clone https://github.com/sneh1117/meditrack-frontend.git
cd meditrack-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

---

## ⚙️ Configuration

Update the API URL in `src/App.jsx` line 8:

```javascript
// Local development
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Production
const API_BASE_URL = 'https://meditrack.up.railway.app/api';
```

---

## 🏗️ Build & Deploy

**Build for production:**
```bash
npm run build
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to the Vercel dashboard for automatic deployments on every push.

---

## 📱 Pages

| Page | Description |
|------|-------------|
| Landing | Marketing page with feature overview |
| Login | JWT authentication |
| Register | Create patient or doctor account |
| Dashboard | Stats, charts, and quick navigation |
| Medications | Add, view, and delete medications |
| Symptoms | Log and view symptom history |
| History | 7-day symptom timeline grouped by date |
| AI Insights | Gemini-powered health analysis |
| Settings | Profile info and email preferences |

---

## 📄 PDF Health Report

Patients can export a PDF health report directly from the dashboard. The report includes:

- Medications, symptoms, mood summary and AI insights
- Selectable date range — last 7, 30, or 90 days
- Automatically downloads to your device

---

## 🔔 Email Preferences

From the Settings page, patients can toggle the **Weekly Health Digest** email on or off. The digest is sent every Sunday at 9:00 AM UTC and includes a summary of the past week's health data.

---

## 📁 Project Structure

```
src/
├── App.jsx          # Main app — all pages and components
├── LandingPage.jsx  # Landing page component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

---

## 🔧 Troubleshooting

**API Connection Error:**
- Check Django backend is running at `http://127.0.0.1:8000`
- Verify `API_BASE_URL` in `src/App.jsx`
- Check Django `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

**Module Not Found:**
```bash
npm install lucide-react
npm install chart.js react-chartjs-2
```

**Port Already in Use:**
```bash
# Kill process on port 5173
npx kill-port 5173
# Or change port in vite.config.js
```

**PDF Not Downloading:**
- Make sure you're logged in as a **patient** account (doctors cannot export reports)
- Check the backend is running and `reports/export/` endpoint is reachable

---

## 🔗 Related

- **Backend Repo:** https://github.com/sneh1117/MediTrack
- **Live App:** https://meditrack7.vercel.app
- **API Docs:** https://meditrack.up.railway.app/api/docs/

---

## 📝 License

MIT License — feel free to use, modify, and distribute.

---

## 👩‍💻 Author

**Sneha**  
GitHub: [sneh1117](https://github.com/sneh1117)

---

## 📋 Changelog

### Version 2.0
- PDF health report export with date range selector
- Weekly email digest toggle in settings
- Settings page with profile info and email preferences
- 7-day symptom history timeline page
- Toast notifications for all user actions
- Settings link in navbar and dashboard
- Interactive Chart.js dashboard charts
- 5-card dashboard navigation

### Version 1.0
- Initial release
- JWT auth, medications, symptoms, AI insights
