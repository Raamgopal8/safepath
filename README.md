# SafePath AI

SafePath AI is an AI-powered sustainable navigation mobile app built with React Native (Expo). It recommends healthier travel routes based on user health profile and environmental risk factors such as AQI, PM2.5, PM10, dust, and chemical irritants.

## Core Value

SafePath AI helps users choose the healthiest route, not just the fastest route.

## Features Implemented

- Health onboarding profile
  - Condition: Asthma / Allergy / Normal
  - Sensitivity: Low / Medium / High
  - Stored locally using AsyncStorage
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

- React Native + Expo
- Context API for app state
- AsyncStorage for local persistence
- react-native-maps for map rendering
- expo-location for location access
- expo-speech for voice assistant
- OpenWeather Air Pollution API (optional live data)

## Project Structure

- App.js: Main mobile UI and feature composition
- src/context/AppContext.js: Shared state, data orchestration, route refresh logic
- src/services/environmentService.js: API + mock air quality data
- src/services/scoringService.js: Health-aware route scoring and ranking
- src/services/recommendationService.js: AI explanation, alerts, simulation logic
- src/services/storage.js: AsyncStorage wrapper
- src/components/: Reusable UI building blocks
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
