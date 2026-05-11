import { StyleSheet } from "react-native";

export const theme = {
  colors: {
    background: "#F2F7EF",
    panel: "#FFFFFF",
    panelSoft: "#EEF6E8",
    primary: "#1E6B52",
    secondary: "#2B8A63",
    accent: "#E1B44A",
    danger: "#C53F3F",
    warning: "#D0841F",
    success: "#2D9C63",
    textMain: "#163129",
    textSubtle: "#527267",
    border: "#D7E6D8",
    mapOverlay: "rgba(21, 44, 37, 0.75)",
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  subHeader: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  role: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  btnText: {
    color: "#fff",
    fontSize: 13,
  },
});