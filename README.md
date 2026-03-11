# MediTrack Frontend

![Frontend CI](https://github.com/sneh1117/MediTrack-frontend/actions/workflows/react-ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-purple)
![Tailwind](https://img.shields.io/badge/TailwindCSS-Styling-blue)
![Chart.js](https://img.shields.io/badge/Chart.js-Data%20Visualization-orange)
![Google OAuth](https://img.shields.io/badge/Auth-Google%20OAuth-red)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://meditrack7.vercel.app)
[![API Docs](https://img.shields.io/badge/API-Docs-blue)](https://meditrack.up.railway.app/api/docs/)

A React dashboard for managing medications, tracking symptoms, logging mood, exporting health reports, and getting AI-powered health insights.

**Live App:** https://meditrack7.vercel.app  
<img width="1282" height="717" alt="image" src="https://github.com/user-attachments/assets/9d6b2ea4-24ab-4ba8-8a1b-732da5d0201d" />
 
**API Docs:** https://meditrack.up.railway.app/api/docs/
<img width="1363" height="716" alt="Screenshot 2026-03-09 165623" src="https://github.com/user-attachments/assets/0720975c-ab9e-46f6-a3ac-af7b62aa9910" />

---

## 🚀 Features

- **Authentication:**
  - User registration & login with JWT authentication
  - Google OAuth integration for one-click sign-in
  - Secure token-based session management
- **Dark Mode:** 
  - System preference detection
  - Manual toggle in navbar
  - Persistent theme selection (stored in localStorage)
  - Smooth transitions throughout entire app
- **Profile Management:**
  - Fully editable user profile with real-time validation
  - Update username, email, phone, and date of birth
  - Role-based permissions (role cannot be changed after registration)
  - Duplicate detection for username and email
  - Toggle weekly email digest preferences
- **Onboarding Wizard:** ⭐ New
  - 3-step guided setup shown once to new patients after first login
  - Step 1: Add first medication with full form (name, dosage, frequency, start date)
  - Step 2: Log first symptom with severity slider and notes
  - Step 3: Completion summary showing what was set up
  - Smart one-time trigger — checks both localStorage flag AND live API data, so users who already have medications or symptoms never see it again
  - Skip individual steps or dismiss entire wizard without losing progress
  - Doctors excluded — wizard only shows for patients
  - Fully responsive — scrollable on mobile, adapts gracefully to all screen sizes
  - Animated step indicators with progress bar
- Add, edit, and manage medications with frequency scheduling
- Log and track daily symptoms with severity ratings (1-10)
- Mood logging (1-5 scale) with trend tracking
- AI health insights powered by Google Gemini
- PDF health report export (7, 30, or 90 day range)
- Weekly email digest toggle in profile settings
- Interactive symptom trend and common symptoms charts
- 7-day symptom history timeline
- Settings page with editable profile info and email preferences
- Toast notifications for all actions
- Responsive design — works on mobile and desktop
- Doctor and patient role support

---
<img width="1345" height="612" alt="image" src="https://github.com/user-attachments/assets/3b319070-d8d6-4072-8d5e-2d6b0edb237f" />


<img width="1347" height="616" alt="image" src="https://github.com/user-attachments/assets/c9ed66ae-6ca4-4086-b56a-b7856651c462" />


<img width="698" height="586" alt="image" src="https://github.com/user-attachments/assets/3d97d90e-76e5-41bc-8600-a46fcfe73afd" />

<img width="1350" height="630" alt="image" src="https://github.com/user-attachments/assets/4544afc7-ebd9-4fa5-a05e-52c88d7cf1ee" />

<img width="1342" height="571" alt="image" src="https://github.com/user-attachments/assets/8541efca-2c05-4162-93fb-f94034eb8a88" />

<img width="1322" height="609" alt="image" src="https://github.com/user-attachments/assets/bb9a7609-c2c5-4afa-8b75-1861f30e1315" />

<img width="1317" height="456" alt="image" src="https://github.com/user-attachments/assets/30e555bd-1363-490b-bbbb-e06c0f220e74" />

<img width="1322" height="571" alt="image" src="https://github.com/user-attachments/assets/aaeeb7bb-a215-41e8-a31d-4173029e57d9" />

<img width="1324" height="524" alt="image" src="https://github.com/user-attachments/assets/a57b9154-21cb-4704-a891-54769845a809" />

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS with Dark Mode |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Authentication | JWT + Google OAuth 2.0 |
| OAuth Library | @react-oauth/google |
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

### API URL Setup

Update the API URL in `src/App.jsx` line 8:

```javascript
// Local development
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Production
const API_BASE_URL = 'https://meditrack.up.railway.app/api';
```

### Google OAuth Setup

**1. Create Environment Variable:**

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**2. Get Google OAuth Credentials:**

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project or select existing one
- Enable Google+ API
- Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
- Application type: **Web application**
- Authorized JavaScript origins:
  - `http://localhost:5173` (for development)
  - `https://meditrack7.vercel.app` (for production)
- Authorized redirect URIs:
  - `http://localhost:5173`
  - `https://meditrack7.vercel.app`
- Copy the **Client ID** and add it to `.env`

**3. Vercel Deployment:**

For production, add the environment variable in Vercel:
- Go to your Vercel project settings
- Navigate to **Environment Variables**
- Add `VITE_GOOGLE_CLIENT_ID` with your Client ID
- Redeploy your application

---

## 🧙 Onboarding Wizard

New patients are guided through a 3-step setup wizard the first time they log in. This improves activation rates by helping users add their first medication and symptom immediately after signup.

### How It Works

1. After login, the frontend fetches the user's profile
2. If the user is a **patient** with no prior data, the wizard appears as a full-screen modal overlay
3. Once completed or dismissed, a localStorage flag is set — it **never shows again**
4. As a double safety net, the app also queries `/api/medications/` and `/api/symptoms/` before showing — users who already have data always skip the wizard even without the localStorage flag

### Steps

| Step | Description |
|------|-------------|
| 1 — Medication | Add first medication: name, dosage, frequency, start date, notes |
| 2 — Symptom | Log first symptom: name, severity (1-10 slider), date, notes |
| 3 — Done | Summary of what was set up, links to dashboard |

### Key Design Decisions

- **Non-blocking:** each step has a "Skip for now" button — users are never forced to complete it
- **Doctors excluded:** wizard only triggers for `role === 'patient'`
- **Idempotent:** uses both localStorage AND a live API check, so the trigger is reliable across browsers/devices
- **Responsive:** full-screen overlay scrolls on mobile; compact layout on small screens with adaptive padding and font sizes

### Component

The wizard lives in `src/OnboardingWizard.jsx` as a standalone component imported into `App.jsx`:

```jsx
// App.jsx — trigger logic
async function checkAndShowOnboarding(user) {
  if (!user || user.role !== 'patient') return;
  const key = `onboarding_complete_${user.username}`;
  if (localStorage.getItem(key)) return;

  // Check if user already has data
  const [meds, symp] = await Promise.all([
    fetch('/api/medications/', { headers }),
    fetch('/api/symptoms/', { headers }),
  ]);
  const hasData = meds.length > 0 || symp.length > 0;
  if (hasData) {
    localStorage.setItem(key, 'true'); // silently mark done
  } else {
    setShowOnboarding(true);
  }
}
```

---

## 🌓 Dark Mode

MediTrack includes a comprehensive dark mode that works throughout the entire application:

### Features
- **Automatic Detection:** Respects system dark mode preference on first load
- **Manual Toggle:** Sun/Moon icon button in the navbar to switch themes
- **Persistent:** Theme preference saved to localStorage
- **Smooth Transitions:** All color changes animate smoothly
- **Complete Coverage:** Every component, card, form, and page supports dark mode

### Implementation
The dark mode uses Tailwind CSS's built-in dark mode with the `class` strategy:

```javascript
// Theme is stored in localStorage as 'theme'
// Applied to <html> element via 'dark' class
// All components use dark: utility classes

// Example:
className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
```

---

## ⚙️ Editable Settings Page

The Settings page allows users to edit their profile information with full validation:

### Editable Fields
- **Username** (required, min 3 characters)
- **Email** (required, valid email format)
- **Phone** (optional, validated format)
- **Date of Birth** (optional, must be in the past)
- **Email Digest Toggle** (patients only)

### Validation Rules

| Field | Validation |
|-------|-----------|
| Username | Required, min 3 chars, must be unique |
| Email | Required, valid format, must be unique |
| Phone | Optional, 7-15 digits with +()- allowed |
| Date of Birth | Optional, must be in past, max 150 years ago |
| Email Digest | Boolean toggle (patients only) |

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

## 🔐 Authentication Flow

### Traditional Login
1. User enters username and password
2. Backend validates credentials
3. JWT tokens returned and stored in localStorage
4. User redirected to dashboard

### Google OAuth Login
1. User clicks "Sign in with Google" button
2. Google authentication popup appears
3. User selects Google account
4. Google returns credential token
5. Frontend sends token to backend `/auth/google/` endpoint
6. Backend verifies token with Google's API
7. **Existing user:** JWT tokens returned → auto login
8. **New user:** User data returned → username selection page
9. User picks username and role → account created → auto login

---

## 📱 Pages

| Page | Description |
|------|-------------|
| Landing | Marketing page with feature overview |
| Login | JWT authentication + Google OAuth |
| Register | Create patient or doctor account + Google OAuth |
| Google Register | Username picker for new Google users |
| Dashboard | Stats, charts, and quick navigation |
| Medications | Add, view, and delete medications |
| Symptoms | Log and view symptom history |
| History | 7-day symptom timeline grouped by date |
| AI Insights | Gemini-powered health analysis |
| Settings | Editable profile info and email preferences |

---

## 📄 PDF Health Report

Patients can export a PDF health report directly from the dashboard. The report includes:

- Medications, symptoms, mood summary and AI insights
- Selectable date range — last 7, 30, or 90 days
- Automatically downloads to your device

---

## 📁 Project Structure

```
src/
├── App.jsx              # Main app — all pages and components
├── LandingPage.jsx      # Landing page component
├── OnboardingWizard.jsx # ⭐ New patient onboarding wizard
├── main.jsx             # Entry point with GoogleOAuthProvider
└── index.css            # Global styles with dark mode support

.env                     # Environment variables (not committed)
tailwind.config.js       # Tailwind config with dark mode enabled
```

---

## 🔧 Troubleshooting

**API Connection Error:**
- Check Django backend is running at `http://127.0.0.1:8000`
- Verify `API_BASE_URL` in `src/App.jsx`
- Check Django `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

**Onboarding Wizard keeps appearing:**
- Open browser DevTools → Application → Local Storage
- Check for key `onboarding_complete_<your_username>` — if missing, the wizard will show
- If you have existing data but the wizard still shows, it will auto-dismiss and set the flag on next login

**Google OAuth Errors:**
- Verify `http://localhost:5173` is in Google Console authorized origins
- Wait 5-10 minutes for Google's changes to propagate
- Check Client ID in `.env` matches Google Console

**Dark Mode Not Working:**
- Check `tailwind.config.js` has `darkMode: 'class'`
- Clear localStorage and refresh page

**Profile Update Errors:**
- **"Username already taken"** — Try a different username
- **"Email already taken"** — Email is registered to another account

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

### Version 2.4 (Latest) ⭐
- **Onboarding Wizard**
  - 3-step guided setup for new patients (medication → symptom → done)
  - Smart one-time trigger using both localStorage and live API check
  - Skip individual steps or dismiss entire wizard at any point
  - Doctors excluded from onboarding flow
  - Fully responsive — scrollable modal on mobile, adaptive layout at all breakpoints
  - Animated step indicators, completion summary, and progress bar

### Version 2.3
- **Unit Tests & CI/CD Pipeline**
  - 30 automated unit tests covering components and validation logic
  - GitHub Actions CI pipeline running on every push and pull request
  - Tests cover Toast, ThemeToggle, form validation, severity helpers, and sorting
  - Build check runs automatically after tests pass
  - Vitest + React Testing Library setup

### Version 2.2
- **Dark Mode** — system preference detection, manual toggle, persistent storage
- **Editable Settings Page** — real-time validation, duplicate detection, email digest toggle

### Version 2.1
- **Google OAuth Integration** — one-click sign-in/sign-up, streamlined username selection

### Version 2.0
- PDF health report export, weekly email digest toggle, 7-day history timeline, Chart.js charts

### Version 1.0
- Initial release — JWT auth, medications, symptoms, AI insights

---

## 🔒 Security Notes

- Google OAuth tokens are verified server-side
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- CORS properly configured for cross-origin requests
- Environment variables used for sensitive credentials
- Profile updates validated both client-side and server-side
- Role field protected from modification after registration
