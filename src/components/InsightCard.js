import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";

export default function InsightCard({ title, text }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ECF6E4",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
  },
  title: {
    fontWeight: "700",
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  text: {
    color: theme.colors.textSubtle,
    lineHeight: 20,
  },
});
