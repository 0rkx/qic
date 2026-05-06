# Doha Insurance & City Services App

Doha Insurance & City Services is a mobile-first web application designed to help users in Qatar manage their vehicle insurance, access emergency roadside assistance, and discover city services. It provides a unified portal for vehicle management, insurance purchasing, EV charging navigation, and emergency support through a modern, role-based UI.

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Folder Structure](#folder-structure)
- [Important Code Concepts](#important-code-concepts)
- [Architectural Decisions](#architectural-decisions)
- [Data Model](#data-model)
- [Main User Flows](#main-user-flows)
- [Setup Instructions](#setup-instructions)
- [Available Scripts](#available-scripts)
- [Configuration Notes](#configuration-notes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Learning Outcomes](#learning-outcomes)
- [Screenshots](#screenshots)
- [License](#license)

## About the Project

This project addresses the fragmentation of vehicle-related services in Qatar by combining insurance management, roadside assistance, and city navigation into a single, cohesive interface. The intended users are drivers and vehicle owners in Doha who need quick access to services like battery jumpstarts, EV towing, policy renewals, and city discovery.

The current implementation is a high-fidelity prototype that simulates an iOS-style mobile app. It runs locally and relies on client-side state for navigation and workflow demonstration, making it ideal for testing user flows and interface design before integrating with a persistent backend. Users can navigate through various service hubs, report claims, and interact with an AI assistant for guidance.

## Key Features

- **Service Dashboards**: The app includes distinct hubs for City Services, Insurance, and Emergency support. Each dashboard presents relevant options, such as purchasing a policy or requesting flat tire service.
- **EV Assistance Flow**: Specialized screens for Electric Vehicle owners, including a Charging Navigator to find nearby stations, Mobile Charging requests, and EV Towing services.
- **AI Integration**: A built-in chat interface powered by Google's Gemini API allows users to ask questions and receive intelligent responses.
- **Interactive Map**: A Map component simulates location tracking and service tracking (e.g., ETA for a tow truck) using static map assets and Framer Motion for animations.
- **Client-Side Routing**: Custom navigation logic (`navigate` function) manages transitions between screens without requiring a dedicated routing library, preserving state across the simulated mobile environment.

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React / Vite / TypeScript | Core UI framework, fast development server, and type safety. |
| Styling | Tailwind CSS / Framer Motion | Utility-first styling for rapid UI development and smooth page transitions. |
| AI / Services | Google Generative AI | Powers the intelligent chat feature via the Gemini API. |
| State | React `useState` / `useEffect` | Manages active screens, modal visibility, and navigation history. |
| Icons | Lucide React | Consistent, scalable SVG icons used throughout the app. |

## System Architecture

The application is structured as a Single Page Application (SPA) designed to render within a mobile emulator container (`.iphone-emulator`).

```txt
User Device
  ↓
React App Shell (App.tsx)
  ↓
Navigation Layer (Custom State Router)
  ↓
Feature Screens (e.g., HomeScreen, EmergencyScreen)
  ↓
Reusable UI Components (Header, MapContainer, BottomNav)
```

Data flows unidirectionally from the main `App` component down to individual screens. State changes, such as requesting a service or changing tabs, trigger re-renders of the active screen using React's built-in hooks. The Gemini API is accessed via a dedicated service module (`services/gemini.ts`), which handles communication with the external endpoint.

## Folder Structure

```txt
src/
  assets/          Static images, icons, and map placeholders
  components/      Reusable UI elements (Icons, PageTransition, MotionHelpers)
  services/        External API integrations (gemini.ts)
  App.tsx          Main entry point containing screen components and routing logic
  types.ts         Shared TypeScript interfaces (ScreenName, TabName, Charger, etc.)
  index.css        Global styles and Tailwind directives
  vite.config.ts   Vite build and environment configuration
```

## Important Code Concepts

- **Custom Navigation State**: Instead of React Router, the app uses a custom `NavigationState` object managed by `useState` in `App.tsx`. This approach is lightweight and suited for simulating a stack-based mobile navigation paradigm.
- **Page Transitions**: Framer Motion is heavily utilized to create iOS-like sliding transitions between screens, enhancing the native app feel. The `PageTransition` component wraps screen renders.
- **Gemini Integration**: The `askGemini` function abstracts the Google Generative AI SDK, providing a simple asynchronous interface for components to fetch AI responses based on user prompts.
- **Type Definitions**: `types.ts` centralizes data structures like `Vehicle`, `Charger`, and `ScreenName`. This ensures that screen props and state objects remain consistent across the large `App.tsx` file.

## Architectural Decisions

- **Single-File Component Organization**: Currently, many screen components are housed within `App.tsx`. While this makes the main file large, it reflects an early prototyping phase where keeping logic co-located speeds up iteration. As the app grows, these will likely be refactored into separate files.
- **Client-Side State for Prototyping**: The app does not yet use a global state manager (like Redux) or a backend database. This decision allows the team to focus purely on the user experience and interaction design without being bogged down by complex data fetching or synchronization logic at this stage.
- **Vite + React**: Chosen for its fast Hot Module Replacement (HMR) and optimized build process, which is essential for rapidly testing UI changes in the emulator view.

## Data Model

Based on the TypeScript definitions in `types.ts`, the core entities are:

- **Charger**: Represents an EV charging station. It tracks fields like `id`, `name`, `speed` (Fast/Slow), `status` (Available/Busy), `distance`, and coordinates (`lat`, `lng`).
- **Vehicle**: Represents a user's car, containing properties such as `make`, `model`, `insuranceStatus` (Active/Expired/Pending), `fuelType`, and `mileage`.
- **NavigationState**: Manages the current view with `screen` (type `ScreenName`) and optional `params` for passing data between screens.

## Main User Flows

- **Emergency Assistance Request**:
  1. User taps the Emergency tab, opening the `EmergencyScreen`.
  2. User selects an option like "Roadside Standard" or "EV Assistance".
  3. The app navigates to the specific service screen (e.g., `EVAssistanceScreen`).
  4. User confirms their location and requests help.
  5. The app transitions to a `SuccessScreen` displaying an ETA and tracking information.
- **EV Charging Navigation**:
  1. User opens the City tab or selects Charging Navigator from EV Assistance.
  2. The `ChargingNavigatorScreen` displays a list of nearby `Charger` objects.
  3. User can filter by speed or availability and view locations on the simulated map.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

Clone the repository and install dependencies using npm:

```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

### Environment Variables

The project requires a Google Gemini API key to enable the AI chat features. Create a `.env` file in the root directory and add the following:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Running Locally

Start the Vite development server:

`npm run dev`

Open your browser to the port specified by Vite to view the app.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server with Hot Module Replacement |
| `npm run build` | Compiles the TypeScript code and builds the production app |
| `npm run preview` | Serves the production build locally for testing |

## Configuration Notes

- `vite.config.ts`: Configures the React plugin, sets the dev server host/port, and defines environment variables (mapping `VITE_GEMINI_API_KEY` to `process.env`).
- `tsconfig.json`: Specifies TypeScript compiler options, enabling ESNext modules and setting path aliases (e.g., `@/` for root imports).
- `package.json`: Defines dependencies including React, Framer Motion, Lucide React, and the Google Generative AI SDK.

## Testing

Automated tests are not currently included in this repository.

Future testing efforts should focus on:
- **Component Tests**: Validating the rendering of UI components like `Header` and `ServiceCard`.
- **Workflow Tests**: Simulating user journeys through the emergency request and insurance purchase flows.
- **Unit Tests**: Testing the custom `navigate` logic and the `askGemini` service function.

## Deployment

No deployment-specific configuration (like a `vercel.json` or `netlify.toml`) was found. Since this is a standard Vite React application, it can generally be deployed to platforms such as Vercel, Netlify, or Cloudflare Pages.

The deployment process typically involves running `npm run build` and serving the resulting `dist` directory.

## Future Improvements

- **Component Extraction**: Refactor the large `App.tsx` file by moving screen components (e.g., `HomeScreen`, `EmergencyScreen`) into separate files within a `src/screens` or `src/pages` directory.
- **Backend Persistence**: Integrate a backend service (e.g., Supabase or Firebase) to store user profiles, vehicles, and active service requests, moving away from ephemeral client-side state.
- **Authentication**: Implement a login flow to personalize the dashboard and secure user data.
- **Real Maps Integration**: Replace the static map images with interactive map components using Google Maps or Mapbox APIs for accurate location tracking.

## Learning Outcomes

This project demonstrates strong capabilities in front-end architecture and prototyping. By building a custom navigation stack and utilizing Framer Motion, it shows an understanding of how to emulate native mobile experiences within a web browser. The integration of the Gemini API highlights the ability to work with modern AI services to enhance user interaction. Furthermore, the use of TypeScript for modeling domain-specific data (like `Vehicle` and `Charger`) showcases an appreciation for type safety and structured application design prior to full backend implementation.

## Screenshots

Screenshots can be added here to show the main dashboards, workflows, and the EV assistance screens.

## License

License information has not been specified yet.
