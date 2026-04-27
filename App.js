import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import AlertBanner from "./src/components/AlertBanner";
import Chatbot from "./src/components/Chatbot";
import DashboardCard from "./src/components/DashboardCard";
import DestinationEditor from "./src/components/DestinationEditor";
import HealthProfileCard from "./src/components/HealthProfileCard";
import InsightCard from "./src/components/InsightCard";
import RouteCard from "./src/components/RouteCard";
import SidebarMenu from "./src/components/SidebarMenu";
import { theme } from "./src/constants/theme";
import { AppProvider, useAppState } from "./src/context/AppContext";

const MobileWebView = Platform.select({
  web: null,
  default: require("react-native-webview").WebView,
});

function comparisonText(fastest, selected) {
  if (!fastest || !selected) {
    return "Route analysis is running...";
  }

  return `Fastest: ${fastest.durationMin} min, pollution ${fastest.pollutionIndex}. Selected: ${selected.durationMin} min, pollution ${selected.pollutionIndex}.`;
}

function buildMapUrl(origin, destination) {
  const originPoint = `${origin.latitude},${origin.longitude}`;
  const destinationPoint = `${destination.latitude},${destination.longitude}`;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originPoint}%3B${destinationPoint}#map=12/${origin.latitude}/${origin.longitude}&layers=T`;
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

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [chatbotVisible, setChatbotVisible] = useState(false);

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

  const mapUrl = useMemo(
    () => buildMapUrl(origin, destination),
    [destination.latitude, destination.longitude, origin.latitude, origin.longitude],
  );

  const heroAnimatedStyle = useMemo(
    () => ({
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    }),
    [fadeAnim, slideAnim],
  );

  useEffect(() => {
    setIsMapLoading(true);
  }, [mapUrl]);

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
          style={[styles.heroAnimated, heroAnimatedStyle]}
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
            <View style={styles.heroButtons}>
              <TouchableOpacity onPress={() => setChatbotVisible(true)} style={styles.chatBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuBtn}>
                <Ionicons name="menu-outline" size={28} color={theme.colors.textMain} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <View style={styles.mapPanel}>
          {Platform.OS === "web" ? (
            <View style={styles.webFrameWrapper}>
              <iframe
                title="SafePath directions map"
                src={mapUrl}
                onLoad={() => setIsMapLoading(false)}
                style={styles.webFrame}
              />
            </View>
          ) : (
            !!MobileWebView && (
              <MobileWebView
                source={{ uri: mapUrl }}
                onLoadEnd={() => setIsMapLoading(false)}
                style={styles.mobileWebView}
              />
            )
          )}

          {isMapLoading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}
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

      <Modal
        visible={chatbotVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setChatbotVisible(false)}
      >
        <Chatbot
          healthProfile={healthProfile}
          onUpdateHealthProfile={updateHealthProfile}
          routes={routes}
          activeRoute={activeRoute}
          recommendation={recommendation}
          alerts={alerts}
          onRouteSelect={setActiveRouteId}
          onClose={() => setChatbotVisible(false)}
        />
      </Modal>
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
  heroAnimated: {
    width: "100%",
  },
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
  heroButtons: {
    flexDirection: "row",
    gap: 8,
  },
  chatBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(45, 156, 99, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(45, 156, 99, 0.2)",
  },
  mapPanel: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
  },
  mobileWebView: {
    width: "100%",
    height: 280,
  },
  webFrameWrapper: {
    width: "100%",
    height: 280,
  },
  webFrame: {
    width: "100%",
    height: "100%",
    borderWidth: 0,
    borderColor: "transparent",
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.72)",
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
