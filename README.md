# SafePath AI

SafePath AI is an AI-powered sustainable navigation mobile app built with React Native (Expo). It recommends healthier travel routes based on user health profile and environmental risk factors such as AQI, PM2.5, PM10, dust, and chemical irritants.

## Core Value

SafePath AI helps users choose the healthiest route, not just the fastest route.

## Architecture

- **Frontend**: React Native (Expo) mobile app
- **Backend**: Node.js/Express API with MongoDB
- **Authentication**: JWT-based user authentication
- **Data Storage**: MongoDB for user profiles and route history
- **APIs**: RESTful endpoints for user management and route data

## Features Implemented

- **User Authentication**
  - Registration and login with JWT tokens
  - Secure password hashing
  - User profile management
- Health onboarding profile
  - Condition: Asthma / Allergy / Normal
  - Sensitivity: Low / Medium / High
  - Synced with backend database
- **Route History**
  - Save completed routes to backend
  - View route history with environmental scores
  - Route statistics and analytics
- Map and route visualization
  - Current location (with permission)
  - Destination input
  - Multiple route options with color-coded polylines
- Smart route scoring
  - Weighted scoring from AQI, PM2.5, PM10, dust, chemical index, traffic, greenery, and travel time
  - Risk labels: Safe / Moderate / Risky
- Multi-route comparison
  - Fastest route vs healthiest route summary
  - Highlights best route for health profile
- Real-time environmental data
  - OpenWeather Air Pollution API support
  - Backend proxy for API calls
  - Graceful mock-data fallback for demo reliability
- AI recommendation engine
  - Rule-based route advice and health-aware explanation
- Predictive pollution simulation
  - 30/60/120 minute forecast model (API or mock)
  - Delay-travel recommendation when safer
- Safety suggestions and emergency alerting
  - Mask, high dust, inhaler, and unsafe-condition alerts
- Green route optimization
  - Includes greenery weighting and traffic penalty
- Voice assistant (optional)
  - Announces safer route through text-to-speech
- Scenario simulation
  - Fastest now vs healthiest now vs delay 30 minutes
- Impact metrics dashboard
  - Pollution exposure reduction
  - Health score improvement

## Tech Stack

### Frontend
- React Native + Expo
- Context API for app state
- AsyncStorage for local persistence
- react-native-maps for map rendering
- expo-location for location access
- expo-speech for voice assistant

### Backend
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- OpenWeather Air Pollution API proxy

## Project Structure

### Frontend (src/)
- `App.js`: Main mobile UI and feature composition
- `context/AppContext.js`: Shared state, data orchestration, route refresh logic
- `services/`: Business logic and API integration
  - `environmentService.js`: Air quality data (API + mock fallback)
  - `scoringService.js`: Health-aware route scoring and ranking
  - `recommendationService.js`: AI explanation, alerts, simulation logic
  - `storage.js`: AsyncStorage wrapper with backend sync
  - `apiService.js`: Backend API client
- `components/`: Reusable UI building blocks
- `constants/theme.js`: Design system and styling

### Backend (backend/)
- `server.js`: Express server setup and middleware
- `config/db.js`: MongoDB connection
- `models/`: Mongoose schemas
  - `User.js`: User authentication and profiles
  - `RouteHistory.js`: Route tracking and analytics
- `controllers/`: Request handlers
  - `authController.js`: Authentication logic
  - `routeController.js`: Route management
- `routes/`: API endpoint definitions
- `middleware/authMiddleware.js`: JWT authentication
- `services/`: Backend business logic

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Expo CLI (for React Native development)

### Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start MongoDB (if running locally)
mongod

# Start the backend server
npm run dev
```

### Frontend Setup
```bash
npm install

# Configure environment (optional)
# Add EXPO_PUBLIC_OPENWEATHER_API_KEY to .env if using live weather data

# Start the Expo development server
npm start
```

### Environment Variables

#### Backend (.env)
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/safepath
JWT_SECRET=your_super_secret_jwt_key_here
OPENWEATHER_API_KEY=your_openweather_api_key
```

#### Frontend (.env)
```
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
```

## API Endpoints

See `backend/README.md` for complete API documentation with Postman examples.
- src/constants/theme.js: Color and spacing system

## Run Instructions

1. Install dependencies:

```bash
npm install
```

2. Optional: enable live pollution data by creating `.env` from `.env.example`:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

3. Start Expo:

```bash
npm run start
```

4. Open Android/iOS simulator or Expo Go.

## Notes

- If API is unavailable, SafePath AI automatically uses realistic mock environmental data.
- Demo route coordinates are prefilled for a smooth presentation.
