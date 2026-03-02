# 🏥 MediTrack Frontend

A React dashboard for managing medications, tracking symptoms, and getting AI health insights.

## Quick Start

### Prerequisites
- Node.js v16+ 
- npm v8+

### Installation
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

## Configuration

Update API URL in `src/App.jsx`:

**Local Development:**
```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

**Production (Railway):**
```javascript
const API_BASE_URL = 'https://meditrack.up.railway.app/api';
```

## Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel dashboard for auto-deploy.

## Features

- User registration & login with JWT
- Add/manage medications
- Log and track symptoms
- AI health insights (Google Gemini)
- Responsive design
- Password confirmation on signup

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide Icons

## Troubleshooting

**API Connection Error:**
- Check Django backend is running
- Verify API URL in `src/App.jsx`
- Check Django CORS settings include frontend URL

**Module Not Found:**
```bash
npm install lucide-react
```

**Port Already in Use:**
Change port in `vite.config.js` or kill the process on 5173

## Project Structure
```
src/
├── App.jsx          # Main app with all components
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Git Workflow
```bash
# Make changes
git add .
git commit -m "Description"
git push

# Vercel auto-deploys on push
```

## Related

- **Backend:** https://github.com/sneh1117/MediTrack
- **Deployed:** https://meditrack7.vercel.app/

---

**Version 1.0** - Initial Release