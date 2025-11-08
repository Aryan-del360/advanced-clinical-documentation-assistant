<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: [https://ai.studio/apps/drive/1a5NIQrUWfNsSF8oERZBXpeCKAg2OylmB](https://aistudio.google.com/apps/drive/1a5NIQrUWfNsSF8oERZBXpeCKAg2OylmB?showAssistant=true&showPreview=true)

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# Advanced Clinical Documentation Assistant (ACDA)

A lightweight web app that converts clinical conversation transcripts into structured SOAP notes using Google Gemini. Built with React + Vite, hosted on Cloud Run (backend proxy for Gemini), and packaged for mobile with Capacitor.

Demo: https://acda-906934175275.us-central1.run.app
AI Studio preview: [https://ai.studio/apps/drive/1a5NIQrUWfNsSF8oERZBXpeCKAg2OylmB](https://aistudio.google.com/apps/drive/1a5NIQrUWfNsSF8oERZBXpeCKAg2OylmB?showAssistant=true&showPreview=true)

Category tags: AI, Healthcare, Cloud Run, Google Gemini, PWA

---

## Elevator pitch
ACDA ingests clinician–patient conversation transcripts and generates structured SOAP (Subjective, Objective, Assessment, Plan) notes in JSON and human-readable formats. It uses Gemini through a secure backend to avoid exposing API keys in the client.

## What’s included
- Frontend: React + Vite app (UI for transcript input and SOAP output)
- Backend: small Express server to proxy Gemini requests and hold the secret key
- Dockerfile for Cloud Run deployment
- Capacitor scripts to generate an Android project and build APKs

---

## Architecture (one-line)
Frontend (static files) → Cloud Run Express proxy (GEMINI_API_KEY from Secret Manager) → Gemini model

## Quick features
- Generate structured SOAP JSON from transcription
- Download PDF of SOAP note (jsPDF + html2canvas)
- Basic error handling and diagnostic logging for Gemini responses

---

## Setup & local run
Prerequisites: Node.js (v18+ recommended), npm

1) Clone and install:

   git clone https://github.com/Aryan-del360/advanced-clinical-documentation-assistant.git
   cd advanced-clinical-documentation-assistant
   npm install

2) Development

   - Set your Gemini key in `.env.local` (local only):
     GEMINI_API_KEY=your_key_here
   - Start dev server:
     npm run dev

3) Production build (for Cloud Run / AI Studio)

   npm run build
   # built files are in `dist/`

4) Serve locally with the included server:

   npm run start
   # uses server.js (Express) to serve ./dist on PORT (default 8080)

---

## Cloud Run deployment (summary)
1. Build & push container (Cloud Build):

   gcloud builds submit --tag gcr.io/<PROJECT_ID>/acda:latest .

2. Deploy to Cloud Run:

   gcloud run deploy acda --image gcr.io/<PROJECT_ID>/acda:latest --platform managed --region us-central1 --allow-unauthenticated

3. Secure secret (recommended):

   echo -n "YOUR_KEY" | gcloud secrets create gemini-api-key --data-file=-
   gcloud run services update acda --region=us-central1 --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"

Replace <PROJECT_ID> with your GCP project.

---

## AI usage & prompts (summary)
See `AI_USAGE.md` for full prompt templates, expected schema and sample inputs/outputs.

---

## Privacy & PHI
This project is for demonstration. Do NOT deploy with production PHI without proper compliance. Recommendations:
- Never store raw PHI in logs or client-side storage
- Use Secret Manager to store GEMINI_API_KEY
- Use server-side audit logs and rotation policies
- Obtain consent before storing/transmitting health data

---

## How to publish as an AI Studio App (Drive)
1. Run `npm run build`.
2. Upload contents of `dist/` (index.html + assets folder) to a Google Drive folder.
3. In AI Studio, create a new App -> From Drive and pick `index.html`.
4. Ensure your frontend calls your Cloud Run backend (set VITE_BACKEND_URL before building) or omit any API key in client.

---

## Build Android APK (Capacitor)
Prereqs: Android SDK, JDK, Android Studio

1) Init Android project (first time):
   npm run android:init
2) Add platform:
   npm run android:add
3) Sync & build debug APK:
   npm run android:build:debug

The APK will be in `android/app/build/outputs/apk/debug/`.

---

## Devpost / Hackathon checklist
- [x] Public demo URL (Cloud Run)
- [x] Source repo on GitHub
- [ ] Short demo video (1–3 min) — add to README or Devpost
- [x] README with setup & run instructions (this file)
- [x] Notes on AI model and backend usage
- [ ] Privacy/PHI compliance documentation (add more details if you handle real PHI)

---

## Contributing
Contributions welcome. Create PRs for fixes or improvements.

## License
MIT

## Contact / Authors
Aryan-del360

## What's changed (UI refresh)
I performed a focused visual refresh to give ACDA a modern, professional look suitable for demos and hackathons. Changes include:

- Modern header with compact branding and a subtle search input
- Redesigned transcript input panel with accessible controls, recording toggle, and clear/example actions
- New SOAP note display with formatted & JSON views, copy and export-to-PDF actions, and improved alerts for interactions/contraindications
- Global visual polish: Inter font, refined spacing, subtle transitions and improved color tokens

To preview these changes locally:

1. npm install
2. npm run dev
3. Open http://localhost:5173 in your browser (Vite dev) or run `npm run build && npm start` and open http://localhost:8080

If you want me to commit & push these UI changes and redeploy to Cloud Run, say "commit and deploy". If you want an automated APK build workflow, say "add CI APK build".
