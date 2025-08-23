# Carbon Compass

Carbon Compass is a full-stack application designed to visualize and manage urban carbon emissions. It provides performance metrics, future projections, and policy recommendations based on geographical data.

## Features

- **Interactive Map:** Visualize carbon-related data on a Google Maps interface.
- **Performance Metrics:** Display real-time (dummy) air quality metrics like PM2.5, PM10, NOx, CO, Ozone, and SO2.
- **Future Projections:** Show projected carbon density over time with interactive charts.
- **Policy Recommendations:** Generate concise policy recommendations for urban carbon management using Google's Gemini AI.
- **Location-Based Data:** Ability to fetch data based on selected latitude and longitude (currently returns placeholder data if coordinates are provided).

## Logical Flow of the Website

The Carbon Compass application guides the user through a seamless experience of exploring carbon-related data and insights:

1.  **Initial Load & Map Display:**
    *   Upon loading, the frontend (`Navigate.tsx`) initializes a Google Map centered on a default location (Bhubaneswar, India).
    *   Markers for predefined cities are displayed on the map.
    *   The `useGoogleMaps` hook manages the map's lifecycle and user interactions.

2.  **User Interaction - Map Clicks:**
    *   Users can click anywhere on the map to select a specific latitude and longitude.
    *   A blue marker appears at the clicked location, and the `selectedCoordinates` state in the frontend is updated with the chosen `lat` and `lng`.

3.  **Fetching Data - "Get Data" Button:**
    *   The core interaction point is the "Get Data" button in the sidebar.
    *   When clicked, the frontend dispatches two asynchronous requests to the backend:
        *   `GET /api/metrics?lat=<lat>&lng=<lng>`: Fetches performance metrics.
        *   `GET /api/projections?lat=<lat>&lng=<lng>`: Fetches future carbon projections.
    *   If `selectedCoordinates` are available (i.e., the user has clicked on the map), these `lat` and `lng` values are sent as query parameters.
    *   If no coordinates are selected, the requests are sent without `lat` and `lng`, and the backend responds with dummy data.

4.  **Backend Processing:**
    *   The backend (`backend/src/index.ts`) receives these requests.
    *   For `/api/metrics` and `/api/projections`, it checks for the presence of `lat` and `lng` query parameters.
    *   Currently, if `lat` and `lng` are present, it returns a placeholder message indicating that data generation based on coordinates is not yet implemented. Otherwise, it returns predefined dummy data.
    *   For `/api/policies`, the backend directly calls the Google Gemini API to generate policy recommendations.

5.  **Displaying Data - Modals:**
    *   Once data is received from the backend, the frontend updates its state (`metricsData`, `projectionsData`).
    *   The "Performance Metrics" and "Future Projections" navigation items become enabled.
    *   Clicking on these navigation items, or the "Policy Recommendations" item, opens a modal.
    *   The modal displays the fetched data (metrics, charts for projections, or policy recommendations) in a user-friendly format.

6.  **Policy Recommendations:**
    *   Clicking the "Policy Recommendations" navigation item triggers a `GET` request to `/api/policies`.
    *   The backend uses the Google Gemini API to generate 5 concise policy recommendations, which are then displayed in a modal on the frontend.

## Tech Stack

### Frontend

- **Languages:** TypeScript, HTML, CSS
- **Frameworks/Libraries:**
    - **React:** For building the user interface.
    - **Vite:** Fast build tool and development server.
    - **Tailwind CSS:** Utility-first CSS framework for styling.
    - **Shadcn UI:** Re-usable UI components built with Radix UI and Tailwind CSS.
    - **Recharts:** For data visualization and charting.
    - **Google Maps API:** For interactive map functionalities.
- **Package Manager:** pnpm
- **Other Tools:** ESLint, Prettier, Netlify configuration.

### Backend

- **Languages:** TypeScript
- **Runtime:** Node.js
- **Frameworks/Libraries:**
    - **Express.js:** Minimalist web framework for building the API.
    - **CORS:** Middleware for enabling Cross-Origin Resource Sharing.
    - **Dotenv:** For loading environment variables.
    - **Google Generative AI:** For interacting with the Gemini API to generate policy recommendations.
- **Package Manager:** npm (or pnpm, depending on project setup)
- **Other Tools:** TypeScript compiler, Vercel configuration.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (LTS version recommended)
- pnpm (or npm/yarn)
- Google API Key (for Google Maps and Gemini API)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/carbon_compass.git
    cd carbon_compass
    ```

2.  **Install Backend Dependencies:**

    ```bash
    cd backend
    pnpm install # or npm install
    ```

3.  **Install Frontend Dependencies:**

    ```bash
    cd ../frontend
    pnpm install # or npm install
    ```

### Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

And in the `frontend` directory, ensure your Google Maps API key is correctly configured in `frontend/client/pages/Navigate.tsx` (currently hardcoded, but ideally should be an environment variable):

```typescript
const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual key
```

## Running the Application

### Backend

Navigate to the `backend` directory and start the server:

```bash
cd backend
pnpm run dev # or npm run dev
```

The backend server will run on `http://localhost:5000`.

### Frontend

Navigate to the `frontend` directory and start the development server:

```bash
cd frontend
pnpm run dev # or npm run dev
```

The frontend application will typically run on `http://localhost:5173` (or another available port).

## Deployment

This project is configured for deployment on Vercel. 

- **Backend:** The `backend/vercel.json` file is configured to deploy the Node.js Express application.
- **Frontend:** The frontend can be deployed as a static site on Vercel or Netlify.

**Note:** After making changes to the backend `vercel.json` or any backend code, you will need to redeploy the backend on Vercel for the changes to take effect on the live domain.

## Project Structure

```
carbon_compass/
├── backend/                 # Backend Node.js/Express application
│   ├── src/                 # Backend source code (TypeScript)
│   │   └── index.ts         # Main backend entry point, API routes
│   ├── dist/                # Compiled JavaScript output of backend
│   ├── package.json         # Backend dependencies and scripts
│   └── vercel.json          # Vercel deployment configuration for backend
├── frontend/                # Frontend React/Vite application
│   ├── client/              # Frontend source code (React components, pages)
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Application pages (e.g., Navigate.tsx)
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets for frontend
│   ├── node_modules/        # Frontend dependencies
│   ├── package.json         # Frontend dependencies and scripts
│   ├── pnpm-lock.yaml       # pnpm lock file
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   └── vite.config.ts       # Vite build configuration
├── .git/                    # Git version control
├── LICENSE                  # Project license
└── README.md                # This README file
```

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
