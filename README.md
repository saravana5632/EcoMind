<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/079ab495-9a1b-45d8-909b-af88f5416a4a

## Project Architecture & Directory Layout

The application is cleanly organized into clear client-side (frontend) and server-side (backend) directory structures:

```
├── src/                      # [CLIENT] Frontend React Application
│   ├── components/           # UI Views (Farmer, Landlord, Admin, Buyer dashboards, Maps)
│   ├── context/              # Authentication & Global React Context state
│   ├── config/               # Client-side Firebase SDK configuration (ecowin project)
│   ├── services/             # API client services & endpoints
│   ├── types.ts              # Frontend TypeScript interfaces and shared types
│   ├── App.tsx               # Main application container
│   └── main.tsx              # React DOM entry point
│
├── server/                   # [SERVER] Backend Express & Firebase REST Services
│   ├── config/               # Firebase Admin / Firestore SDK & environment configurations
│   ├── controllers/          # Business logic handlers (Land, Farmer, Rental, AI, Analytics)
│   ├── middleware/           # Auth, Role-based Access Control (RBAC), Rate Limiting, Logging
│   ├── models/               # Firestore Data Schemas (User, Land, RentalRequest, Product, etc.)
│   ├── routes/               # Modular Express API endpoints (/api/*)
│   ├── scripts/              # Automated database seeding & migration scripts (seed.ts)
│   ├── services/             # Firebase Firestore CRUD, Haversine 20km Geolocation, Gemini AI
│   └── utils/                # Helpers, response wrappers, and Winston loggers
│
├── firebase-applet-config.json # Active Firebase project credentials & API keys (ECOWIN)
├── firestore.rules           # Security rules for Cloud Firestore
└── server.ts                 # Full-stack Node.js server entry point (port 3000)
```

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
