import React, { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AlertBanner from "./src/components/AlertBanner";
import DashboardCard from "./src/components/DashboardCard";
import DestinationEditor from "./src/components/DestinationEditor";
import HealthProfileCard from "./src/components/HealthProfileCard";
import InsightCard from "./src/components/InsightCard";
import RouteCard from "./src/components/RouteCard";
import SidebarMenu from "./src/components/SidebarMenu";
import { theme } from "./src/constants/theme";
import { AppProvider, useAppState } from "./src/context/AppContext";

function routeColor(route, activeRoute) {
  if (activeRoute?.id === route.id) {
    return "#2D9C63"; // Green
  }
  return "#D32F2F"; // Red
}

function comparisonText(fastest, selected) {
  if (!fastest || !selected) {
    return "Route analysis is running...";
  }

  return `Fastest: ${fastest.durationMin} min, pollution ${fastest.pollutionIndex}. Selected: ${selected.durationMin} min, pollution ${selected.pollutionIndex}.`;
}

function AppContent() {
  const {
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
    forecast,
    dataSource,
  } = useAppState();

  const [sidebarVisible, setSidebarVisible] = React.useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const mapRegion = useMemo(() => {
    const latitude = (origin.latitude + destination.latitude) / 2;
    const longitude = (origin.longitude + destination.longitude) / 2;
    return {
      latitude,
      longitude,
      latitudeDelta: Math.abs(origin.latitude - destination.latitude) + 0.03,
      longitudeDelta: Math.abs(origin.longitude - destination.longitude) + 0.03,
    };
  }, [
    destination.latitude,
    destination.longitude,
    origin.latitude,
    origin.longitude,
  ]);

  const routeComparison = useMemo(
    () => comparisonText(highlighted.fastest, activeRoute),
    [highlighted.fastest, activeRoute],
  );

  const shouldShowEmergency =
    alerts.length && alerts[0].includes("Unsafe conditions");

  const handleRouteVoice = () => {
    if (!highlighted.healthiest) {
      return;
    }

    const message = `Safer route selected. ${highlighted.healthiest.name}. ${highlighted.healthiest.risk.label} exposure risk.`;
    Speech.speak(message, { rate: 0.95, pitch: 1.0 });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View
          style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.heroContainer}>
            <View style={styles.heroTexts}>
              <Text style={styles.heroTitle}>
                SafePath<Text style={styles.heroTitleBold}> AI</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Intelligent Health Routing
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuBtn}>
              <Ionicons name="menu-outline" size={28} color={theme.colors.textMain} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.mapPanel}>
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            region={mapRegion}
          >
            <Marker coordinate={origin} title="Current location" />
            <Marker
              coordinate={destination}
              title="Destination"
              pinColor="#2D9C63"
            />
            {routes.map((route) => (
              <Polyline
                key={route.id}
                coordinates={route.points}
                strokeColor={routeColor(route, activeRoute)}
                strokeWidth={activeRoute?.id === route.id ? 6 : 4}
                zIndex={activeRoute?.id === route.id ? 10 : 1}
              />
            ))}
          </MapView>
        </View>

        <HealthProfileCard
          profile={healthProfile}
          onUpdate={updateHealthProfile}
        />

        <DestinationEditor
          origin={origin}
          onUpdateOrigin={setOrigin}
          destination={destination}
          onUpdate={setDestination}
          onAiHelp={() => Alert.alert("SafePath AI Insight", recommendation)}
        />

        {alerts.map((message, index) => (
          <AlertBanner
            key={`${message}-${index}`}
            message={message}
            tone={shouldShowEmergency && index === 0 ? "danger" : "warning"}
          />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Multi-Route Comparison</Text>
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleRouteVoice}
          >
            <Text style={styles.voiceText}>Voice Assist</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.routeScroll}
        >
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onPress={() => setActiveRouteId(route.id)}
              highlight={activeRoute?.id === route.id}
            />
          ))}
        </ScrollView>

        <InsightCard title="Route Insight" text={routeComparison} />
        <InsightCard title="AI Recommendation" text={recommendation} />

        {!!forecast && (
          <InsightCard
            title="Predictive Pollution (1-2 hrs)"
            text={`30m AQI ${Math.round(forecast.in30.aqi)} | 60m AQI ${Math.round(
              forecast.in60.aqi,
            )} | 120m AQI ${Math.round(forecast.in120.aqi)}. Suggested: wait 30 minutes if possible.`}
          />
        )}

        <DashboardCard
          selectedRoute={activeRoute}
          fastestRoute={highlighted.fastest}
        />
      </ScrollView>

      <SidebarMenu
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 26,
    gap: 12,
  },
  heroContainer: {
    marginTop: 8,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(45, 156, 99, 0.08)',
  },
  heroTexts: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    color: theme.colors.textMain,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  heroTitleBold: {
    fontWeight: "900",
    color: theme.colors.primary,
  },
  heroSubtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    marginTop: 1,
    fontWeight: "500",
  },
  menuBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F7F9F8",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mapPanel: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
  },
  map: {
    width: "100%",
    height: 280,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    color: theme.colors.textMain,
    fontSize: 17,
    fontWeight: "700",
  },
  voiceButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#E0F0E3",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  voiceText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  routeScroll: {
    marginTop: 6,
  },
});
