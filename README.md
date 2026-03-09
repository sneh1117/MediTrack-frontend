# MediTrack Frontend

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
<img width="1345" height="612" alt="image" src="https://github.com/user-attachments/assets/3b319070-d8d6-4072-8d5e-2d6b0edb237f" />


<img width="1347" height="616" alt="image" src="https://github.com/user-attachments/assets/c9ed66ae-6ca4-4086-b56a-b7856651c462" />


<img width="698" height="586" alt="image" src="https://github.com/user-attachments/assets/3d97d90e-76e5-41bc-8600-a46fcfe73afd" />

<img width="1350" height="630" alt="image" src="https://github.com/user-attachments/assets/4544afc7-ebd9-4fa5-a05e-52c88d7cf1ee" />

<img width="1342" height="571" alt="image" src="https://github.com/user-attachments/assets/8541efca-2c05-4162-93fb-f94034eb8a88" />

<img width="1322" height="609" alt="image" src="https://github.com/user-attachments/assets/bb9a7609-c2c5-4afa-8b75-1861f30e1315" />

<img width="1317" height="456" alt="image" src="https://github.com/user-attachments/assets/30e555bd-1363-490b-bbbb-e06c0f220e74" />

<img width="1322" height="571" alt="image" src="https://github.com/user-attachments/assets/aaeeb7bb-a215-41e8-a31d-4173029e57d9" />

<img width="1324" height="524" alt="image" src="https://github.com/user-attachments/assets/a57b9154-21cb-4704-a891-54769845a809" />









## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
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

**Important:** Make sure to add `VITE_GOOGLE_CLIENT_ID` environment variable in Vercel settings before deploying.

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
├── main.jsx         # Entry point with GoogleOAuthProvider
└── index.css        # Global styles

.env                 # Environment variables (not committed)
```

---

## 🔧 Troubleshooting

**API Connection Error:**
- Check Django backend is running at `http://127.0.0.1:8000`
- Verify `API_BASE_URL` in `src/App.jsx`
- Check Django `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

**Google OAuth Errors:**

**"Origin not allowed for the given client ID"**
- Verify `http://localhost:5173` is in Google Console authorized origins
- Wait 5-10 minutes for Google's changes to propagate
- Check Client ID in `.env` matches Google Console

**"Google sign in failed"**
- Check `VITE_GOOGLE_CLIENT_ID` is set correctly in `.env`
- Clear browser cache or try in incognito mode
- Verify Google+ API is enabled in Google Cloud Console

**Google button doesn't appear:**
- Check browser console for Client ID loading message
- Verify `@react-oauth/google` is installed: `npm install @react-oauth/google`
- Make sure `GoogleOAuthProvider` is wrapping the app in `main.jsx`

**Module Not Found:**
```bash
npm install lucide-react
npm install chart.js react-chartjs-2
npm install @react-oauth/google
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

### Version 2.1
- **Google OAuth Integration**
  - One-click sign-in/sign-up with Google
  - Automatic email and name population
  - Streamlined username selection for new users
  - Secure server-side token verification

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

---

## 🔒 Security Notes

- Google OAuth tokens are verified server-side
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- CORS properly configured for cross-origin requests
- OAuth users have no password (unusable password set in backend)
- Environment variables used for sensitive credentials

---

## 🌐 Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456.apps.googleusercontent.com` |

For local development, create a `.env` file. For Vercel deployment, add these in the project settings.
