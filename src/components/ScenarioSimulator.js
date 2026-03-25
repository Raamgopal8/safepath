import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";

function ScenarioBlock({ data, highlight }) {
  if (!data) {
    return null;
  }

  return (
    <View style={[styles.block, highlight && styles.highlight]}>
      <Text style={styles.blockTitle}>{data.title}</Text>
      <Text style={styles.row}>Exposure: {data.exposure}</Text>
      <Text style={styles.row}>ETA: {data.eta} min</Text>
      <Text style={styles.note}>{data.note}</Text>
    </View>
  );
}

export default function ScenarioSimulator({ scenario }) {
  if (!scenario) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Scenario Simulation</Text>
      <ScenarioBlock data={scenario.fastestNow} />
      <ScenarioBlock data={scenario.healthiestNow} highlight />
      <ScenarioBlock data={scenario.delay30} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
    padding: 14,
  },
  title: {
    fontWeight: "700",
    color: theme.colors.textMain,
    marginBottom: 10,
  },
  block: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E7D6",
    backgroundColor: "#F7FBF5",
    padding: 10,
    marginBottom: 8,
  },
  highlight: {
    borderColor: theme.colors.primary,
    backgroundColor: "#E7F6EA",
  },
  blockTitle: {
    color: theme.colors.textMain,
    fontWeight: "700",
  },
  row: {
    color: theme.colors.textSubtle,
    marginTop: 3,
  },
  note: {
    color: theme.colors.textMain,
    marginTop: 6,
    fontSize: 12,
  },
});
