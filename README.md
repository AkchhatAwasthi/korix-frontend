# Korix Frontend

Frontend application for **Korix**, a collaborative project workspace built with React, TypeScript, and Vite.

## Live Links

- Frontend App: https://korix-frontend.vercel.app/
- Backend API: https://korix-backend.onrender.com/api

## What You Can Do

- Register and log in
- Verify email
- View dashboard stats and recent projects
- Create projects
- Open project details
- Invite members to projects
- Create subprojects
- Create and assign tasks
- View tasks across projects
- View team members across projects

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Lucide React

## Pages

- `/` home page
- `/login`
- `/register`
- `/verify-email`
- `/dashboard`
- `/projects`
- `/projects/:projectId`
- `/tasks`
- `/team`
- `/settings`
- `/projects/join`

## Highlights

- Protected routes for authenticated users
- Refresh-token aware API client
- Localhost and production backend switching in the API layer
- Sidebar navigation wired to real pages
- Project task management UI
- Korix branding and custom SVG favicon

## Project Structure

```text
korix-frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── index.html
└── vite.config.ts
```

## Local Development

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Backend Connection

The frontend talks to the backend through `src/api/axios.ts`.

Typical local setup:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000/api`

Production backend:

- `https://korix-backend.onrender.com/api`

## Build

```bash
npm run build
npm run preview
```

## Current Status

- Auth UI is working
- Dashboard and project pages are wired
- Sidebar navigation is fixed and connected
- Task UI is integrated with backend APIs
- Team and settings views are available
- More advanced collaboration and AI workflows can be added next
