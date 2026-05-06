# Qic

qic

## Overview

This README documents the current implementation of `qic`. It is based on the checked-in source files, package manifests, and entry points in the repository.

## What It Covers

- AI-assisted workflow
- web application UI

## Features

- Role-based dashboards and navigation
- Document intake, upload, and parsing flows
- Review queues, status tracking, and task/work-item states
- Gemini/OpenAI integration points for AI-assisted processing
- SEO, metadata, and deployment-oriented website structure

## Tech Stack

- Vite
- React
- TypeScript

## Code Highlights

- Entry points: App.tsx, index.html, index.tsx
- JavaScript tooling and scripts are declared in package.json.

## Project Structure

- `App.tsx`
- `index.html`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `components/Icons.tsx`
- `components/MotionHelpers.tsx`
- `components/PageTransition.tsx`

## Getting Started

Clone the repository and install the dependencies for the part of the project you want to run.

### Frontend / Node

```bash
npm install
npm run dev
```

### Available Scripts

- `dev`: `vite`
- `build`: `vite build`
- `preview`: `vite preview`

## Environment Variables

The code references these environment keys:

- `API_KEY`
- `GEMINI_API_KEY`
- `VITE_GEMINI_API_KEY`

## Development Notes

- Keep generated files, dependency folders, virtual environments, and build outputs out of commits.
- Add screenshots or deployment links here when the project is running in production.
- Update this README when entry points, environment variables, or setup steps change.
