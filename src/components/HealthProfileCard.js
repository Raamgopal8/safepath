import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import { theme } from "../constants/theme";

const ALL_CONDITIONS = [
  "Normal",
  "Asthma",
  "Allergy",
  "COPD",
  "Bronchitis",
  "Heart Disease",
  "Pregnant",
  "Elderly",
  "Children",
];
const SENSITIVITY = ["Low", "Medium", "High"];

export default function HealthProfileCard({ profile, onUpdate }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filteredConditions = ALL_CONDITIONS.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCondition = (c) => {
    onUpdate({ condition: c, sensitivity: profile?.sensitivity || "Medium" });
  };

  const handleSensitivity = (s) => {
    onUpdate({ condition: profile?.condition || "Normal", sensitivity: s });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.title}>Health Filter Configurations</Text>
          {!expanded && (
            <Text style={styles.summaryText}>
              {profile?.condition || "Normal"} • {profile?.sensitivity || "Medium"} Sensitivity
            </Text>
          )}
        </View>
        <Text style={styles.toggleIcon}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.label}>Condition Focus</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search medical conditions..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.colors.textSubtle}
          />
          <View style={styles.row}>
            {filteredConditions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, profile?.condition === item && styles.chipActive]}
                onPress={() => handleCondition(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    profile?.condition === item && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
            {filteredConditions.length === 0 && (
              <Text style={styles.noResults}>No matching conditions found.</Text>
            )}
          </View>

          <Text style={styles.label}>Exposure Sensitivity</Text>
          <View style={styles.row}>
            {SENSITIVITY.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, profile?.sensitivity === item && styles.chipActive]}
                onPress={() => handleSensitivity(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    profile?.sensitivity === item && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: theme.colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.textMain,
  },
  summaryText: {
    color: theme.colors.textSubtle,
    fontSize: 13,
    marginTop: 3,
    fontWeight: "500",
  },
  toggleIcon: {
    fontSize: 14,
    color: theme.colors.textSubtle,
    padding: 6,
  },
  expandedContent: {
    marginTop: 14,
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
    fontWeight: "600",
    color: theme.colors.textMain,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    color: theme.colors.textMain,
  },
  noResults: {
    color: theme.colors.textSubtle,
    fontStyle: "italic",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#F8FBF6",
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#E3F3E8",
  },
  chipText: {
    color: theme.colors.textSubtle,
    fontWeight: "600",
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
});
