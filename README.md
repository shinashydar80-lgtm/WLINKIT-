# WLINKIT

A responsive website studio MVP built with Node.js, Express and vanilla HTML/CSS/JS.

## Run locally
1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Deploy to Render
1. Upload this project to a GitHub repository.
2. In Render, choose **New +** → **Web Service**.
3. Connect the repository.
4. Use build command `npm install` and start command `npm start`.
5. Deploy. Render uses `PORT` automatically.

## Environment variables
The AI integration is intentionally not connected yet. When you choose an AI provider later, add its private API key in Render Dashboard → your service → Environment. Read it only from `process.env` on the server. Never expose it in browser JavaScript.

## Current MVP features
- Responsive WLINKIT dashboard and module navigation
- Create and save website projects in the browser
- Select starter themes and edit page copy
- Live preview of the selected starter website
- Export a standalone HTML website
- Publish area prepared for a future hosting integration

AI generation, image/video generation and public website hosting are not connected in this MVP.
