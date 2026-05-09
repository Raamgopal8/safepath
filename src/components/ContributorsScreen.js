import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import { theme } from "../constants/theme";

const contributors = [
  {
    id: "1",
    name: "Your Name",
    role: "Project Lead",
    image: "https://i.pravatar.cc/150?img=1",
    github: "https://github.com/yourprofile",
  },
  {
    id: "2",
    name: "Member 2",
    role: "UI/UX Designer",
    image: "https://i.pravatar.cc/150?img=2",
    github: "https://github.com/",
  },
  {
    id: "3",
    name: "Member 3",
    role: "AI Logic Dev",
    image: "https://i.pravatar.cc/150?img=3",
    github: "https://github.com/",
  },
];

export default function ContributorsSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Contributors</Text>

      {contributors.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.avatar} />

          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role}</Text>

            <TouchableOpacity
              onPress={() => Linking.openURL(item.github)}
              style={styles.btn}
            >
              <Text style={styles.btnText}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
    color: theme.colors.textMain,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textMain,
  },
  role: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },
  btn: {
    marginTop: 5,
    backgroundColor: theme.colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});