import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../constants/theme";

export default function RouteCard({ route, highlight, onPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(route)}
      style={[styles.card, highlight && styles.highlight]}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{route.name}</Text>
        <Text style={[styles.risk, { color: route.risk.color }]}>
          {route.risk.emoji} {route.risk.label}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Time</Text>
        <Text style={styles.value}>{route.durationMin} min</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Pollution level</Text>
        <Text style={styles.value}>{route.pollutionIndex}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Health score</Text>
        <Text style={styles.value}>{route.healthScore}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>AQI</Text>
        <Text style={styles.value}>{Math.round(route.environment.aqi)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    padding: 14,
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginRight: 10,
  },
  highlight: {
    borderColor: theme.colors.primary,
    shadowColor: "#1E6B52",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    color: theme.colors.textMain,
    fontWeight: "700",
    fontSize: 16,
    maxWidth: "58%",
  },
  risk: {
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    color: theme.colors.textSubtle,
  },
  value: {
    color: theme.colors.textMain,
    fontWeight: "600",
  },
});
