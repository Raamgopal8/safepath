import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as Linking from "expo-linking";
import { theme } from "../constants/theme";

const contributors = [
  {
    id: "1",
    name: "Raam Gopal",
    role: "Founder, Project Lead & Developer",
    image: "https://github.com/Raamgopal8.png",
    github: "https://github.com/Raamgopal8",
  },
  {
    id: "2",
    name: "Dipanita Mondal",
    role: "Contributor",
    image: "https://github.com/dipanita45.png",
    github: "https://github.com/dipanita45",
  },
  {
    id: "3",
    name: "Venkatesh Devarakonda",
    role: "Contributor",
    image: "https://github.com/VenkateshDevarakonda0706.png",
    github: "https://github.com/VenkateshDevarakonda0706",
  },
  {
    id: "4",
    name: "Shrey Amritkar",
    role: "Contributor",
    image: "https://github.com/shreyAmritkar.png",
    github: "https://github.com/shreyAmritkar",
  },
  {
    id: "5",
    name: "Dhruv patel",
    role: "Contributor",
    image: "https://github.com/dhruvpatel31.png",
    github: "https://github.com/dhruvpatel31",
  },
];
  
export default function ContributorsSection() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image 
          source={require("../../assets/contributors_header.png")} 
          style={styles.headerIcon} 
        />
        <Text style={styles.title}>Contributors</Text>
      </View>

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
    marginTop: 20,
    padding: 16,
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
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
    backgroundColor: theme.colors.panelSoft,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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