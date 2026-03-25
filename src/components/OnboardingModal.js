import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
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

export default function OnboardingModal({ visible, onSubmit }) {
  const [condition, setCondition] = useState("Normal");
  const [sensitivity, setSensitivity] = useState("Medium");
  const [search, setSearch] = useState("");

  const filteredConditions = ALL_CONDITIONS.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Set Your Health Profile</Text>
          <Text style={styles.subtitle}>
            SafePath AI personalizes routes for your breathing comfort.
          </Text>

          <Text style={styles.label}>Health condition</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search health conditions..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.colors.textSubtle}
          />
          <View style={styles.row}>
            {filteredConditions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, condition === item && styles.chipActive]}
                onPress={() => setCondition(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    condition === item && styles.chipTextActive,
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

          <Text style={styles.label}>Sensitivity level</Text>
          <View style={styles.row}>
            {SENSITIVITY.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, sensitivity === item && styles.chipActive]}
                onPress={() => setSensitivity(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    sensitivity === item && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => onSubmit({ condition, sensitivity })}
          >
            <Text style={styles.buttonText}>Start Safe Navigation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(12, 31, 24, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: theme.radius.lg,
    padding: 20,
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textMain,
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textSubtle,
    lineHeight: 20,
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
  button: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
