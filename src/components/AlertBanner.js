import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AlertBanner({ message, tone = "warning" }) {
  const palette =
    tone === "danger"
      ? { bg: "#FCE9E9", border: "#E5B3B3", text: "#8A2E2E" }
      : { bg: "#FFF4DF", border: "#F0D7A6", text: "#8A5A16" };

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.text, { color: palette.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontWeight: "600",
    lineHeight: 18,
  },
});
