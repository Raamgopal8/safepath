import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardCard({ selectedRoute, fastestRoute }) {
  if (!selectedRoute || !fastestRoute) return null;

  const savedPm25 = Math.max(0, fastestRoute.environment.pm25 - selectedRoute.environment.pm25);
  const timeDiff = selectedRoute.durationMin - fastestRoute.durationMin;
  const isSafer = savedPm25 > 2;

  const exposureReduction = Math.max(
    0,
    Math.round(
      ((fastestRoute.pollutionIndex - selectedRoute.pollutionIndex) /
        Math.max(1, fastestRoute.pollutionIndex)) *
        100,
    ),
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={20} color="#4ADE80" />
        <Text style={styles.title}>Your Health Impact</Text>
      </View>
      
      <Text style={styles.subtitle}>
        By taking this route instead of the fastest option...
      </Text>

      <View style={styles.grid}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{exposureReduction}%</Text>
          <Text style={styles.metricLabel}>Cleaner Air</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{Math.round(savedPm25)}<Text style={{fontSize: 12}}>µg</Text></Text>
          <Text style={styles.metricLabel}>PM2.5 Avoided</Text>
        </View>
        <View style={[styles.metric, { backgroundColor: timeDiff > 0 ? "rgba(239, 137, 49, 0.15)" : "rgba(74, 222, 128, 0.15)" }]}>
          <Text style={[styles.metricValue, { color: timeDiff > 0 ? "#FCA5A5" : "#4ADE80" }]}>
            {timeDiff > 0 ? `+${timeDiff}` : timeDiff}
          </Text>
          <Text style={styles.metricLabel}>Mins Delay</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isSafer 
            ? `You are actively protecting your lungs from ${Math.round(savedPm25)}µg/m³ of dangerous particulate matter.` 
            : `This route does not offer significant pollution reduction compared to the fastest path.`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#11221A', // Dark premium green
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
  subtitle: {
    color: "#A4C9B4",
    fontSize: 13,
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
  },
  metricValue: {
    color: "#4ADE80",
    fontSize: 22,
    fontWeight: "800",
  },
  metricLabel: {
    marginTop: 5,
    color: "#DDF2E2",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  footerText: {
    color: "#C0D9C8",
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
});
