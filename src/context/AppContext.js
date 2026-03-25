import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Location from "expo-location";
import {
  fetchEnvironmentAt,
  fetchForecastAt,
} from "../services/environmentService";
import {
  generateSafetySuggestions,
  buildAiRecommendation,
  emergencyMessage,
  simulateScenarios,
} from "../services/recommendationService";
import {
  computeImpactMetrics,
  rankRoutes,
  scoreRoute,
} from "../services/scoringService";
import { loadHealthProfile, saveHealthProfile } from "../services/storage";

const AppContext = createContext(null);

const DEMO_ORIGIN = { latitude: 12.9733, longitude: 77.6208 };
const DEMO_DESTINATION = { latitude: 12.9902, longitude: 77.6468 };

async function fetchRouteCandidates(origin, destination) {
  try {
    const midLat = (origin.latitude + destination.latitude) / 2;
    const midLng = (origin.longitude + destination.longitude) / 2;

    const offset1 = { latitude: midLat + 0.005, longitude: midLng - 0.005 };
    const offset2 = { latitude: midLat - 0.005, longitude: midLng + 0.005 };

    const urls = [
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${offset1.longitude},${offset1.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${offset2.longitude},${offset2.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`,
    ];

    const responses = await Promise.all(urls.map(url => fetch(url)));
    const dataList = await Promise.all(responses.map(res => res.json()));

    const routeTypes = [
      { id: "r1", name: "Fastest Route", trafficScore: 72, greeneryScore: 30 },
      { id: "r2", name: "Healthiest Route", trafficScore: 42, greeneryScore: 78 },
      { id: "r3", name: "Balanced Route", trafficScore: 56, greeneryScore: 55 },
    ];

    return routeTypes.map((type, index) => {
      const data = dataList[index];
      const routeData = data?.routes?.[0];
      if (!routeData) throw new Error("OSRM routing failed");

      const durationMin = Math.round((routeData.duration || 0) / 60);

      const points = routeData.geometry.coordinates.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      }));

      return {
        id: type.id,
        name: type.name,
        durationMin: durationMin || 24,
        trafficScore: type.trafficScore,
        greeneryScore: type.greeneryScore,
        points,
      };
    });
  } catch (err) {
    return [
      {
        id: "r1",
        name: "Fastest Route",
        durationMin: 24,
        trafficScore: 72,
        greeneryScore: 30,
        points: [origin, destination],
      },
      {
        id: "r2",
        name: "Healthiest Route",
        durationMin: 31,
        trafficScore: 42,
        greeneryScore: 78,
        points: [origin, destination],
      },
      {
        id: "r3",
        name: "Balanced Route",
        durationMin: 27,
        trafficScore: 56,
        greeneryScore: 55,
        points: [origin, destination],
      },
    ];
  }
}

export function AppProvider({ children }) {
  const [healthProfile, setHealthProfile] = useState({
    condition: "Normal",
    sensitivity: "Medium",
  });
  const [origin, setOrigin] = useState(DEMO_ORIGIN);
  const [destination, setDestination] = useState(DEMO_DESTINATION);
  const [routes, setRoutes] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [dataSource, setDataSource] = useState("mock");
  const [activeRouteId, setActiveRouteId] = useState(null);

  useEffect(() => {
    if (routes.length > 0) {
      const best = rankRoutes(routes).healthiest;
      if (best) setActiveRouteId(best.id);
    }
  }, [routes]);

  useEffect(() => {
    async function hydrate() {
      const saved = await loadHealthProfile();
      if (saved) {
        setHealthProfile(saved);
      }
    }

    hydrate();
  }, []);

  useEffect(() => {
    async function detectLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setOrigin({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      } catch (error) {
        // Keep demo fallback location.
      }
    }

    detectLocation();
  }, []);

  const highlighted = useMemo(() => rankRoutes(routes), [routes]);

  const activeRoute = useMemo(() => {
    if (!activeRouteId) return highlighted.healthiest;
    return routes.find((r) => r.id === activeRouteId) || highlighted.healthiest;
  }, [routes, activeRouteId, highlighted.healthiest]);

  const recommendation = useMemo(() => {
    if (!healthProfile) {
      return "Set your profile to get personalized recommendations.";
    }
    return buildAiRecommendation({
      selectedRoute: activeRoute,
      healthiestRoute: highlighted.healthiest,
      profile: healthProfile,
    });
  }, [activeRoute, highlighted.healthiest, healthProfile]);

  const alerts = useMemo(() => {
    if (!healthProfile || !activeRoute) {
      return [];
    }

    const emergency = emergencyMessage(activeRoute, healthProfile);
    const tips = generateSafetySuggestions(
      activeRoute,
      healthProfile,
    );
    return [...(emergency ? [emergency] : []), ...tips];
  }, [healthProfile, activeRoute]);

  const scenario = useMemo(() => {
    if (!activeRoute?.forecast) {
      return null;
    }

    return simulateScenarios({
      activeRoute,
    });
  }, [activeRoute]);

  const impact = useMemo(
    () =>
      computeImpactMetrics({
        healthiest: highlighted.healthiest,
        fastest: highlighted.fastest,
      }),
    [highlighted.fastest, highlighted.healthiest],
  );

  async function updateHealthProfile(profile) {
    setHealthProfile(profile);
    await saveHealthProfile(profile);
  }

  async function refreshRoutes() {
    if (!healthProfile) {
      return;
    }

    setLoadingRoutes(true);

    const candidates = await fetchRouteCandidates(origin, destination);
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

    try {
      const withEnvironment = await Promise.all(
        candidates.map(async (route, index) => {
          const midIndex = Math.floor(route.points.length / 2);
          const mid = route.points[midIndex] || route.points[0];
          const environment = await fetchEnvironmentAt({
            lat: mid.latitude,
            lng: mid.longitude,
            apiKey,
            seed: index === 0 ? 20 : index === 1 ? 0 : 10,
          });

          return {
            ...route,
            environment,
          };
        }),
      );

      const scored = withEnvironment.map((route) =>
        scoreRoute(route, healthProfile),
      );

      const withForecast = await Promise.all(
        scored.map(async (route) => {
          const midIndex = Math.floor(route.points.length / 2);
          const mid = route.points[midIndex] || route.points[0];
          const fc = await fetchForecastAt({
            lat: mid.latitude,
            lng: mid.longitude,
            apiKey,
            current: route.environment,
          });
          return { ...route, forecast: fc };
        })
      );

      setRoutes(withForecast);
      setDataSource(
        withForecast.some((r) => r.environment.source === "api") ? "api" : "mock",
      );
    } finally {
      setLoadingRoutes(false);
    }
  }

  useEffect(() => {
    if (healthProfile) {
      refreshRoutes();
    }
  }, [
    healthProfile,
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  ]);

  const value = {
    healthProfile,
    updateHealthProfile,
    origin,
    setOrigin,
    destination,
    setDestination,
    routes,
    loadingRoutes,
    refreshRoutes,
    highlighted,
    activeRoute,
    setActiveRouteId,
    recommendation,
    alerts,
    scenario,
    impact,
    forecast: activeRoute?.forecast,
    dataSource,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}
