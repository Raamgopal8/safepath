import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../constants/theme";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

export default function SidebarMenu({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  // If completely hidden and animation is finished, don't render native modal
  // but to keep it simple, Modal with transparent=true unmounts seamlessly if we rely on visible prop.
  // We'll wrap visible with a slight delay using a state if we want exit animations,
  // For standard RN Modal, exit animation needs a wrapper or we just conditionally render.
  const [renderModal, setRenderModal] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setRenderModal(true);
    } else {
      const timer = setTimeout(() => setRenderModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!renderModal) return null;

  return (
    <Modal visible={renderModal} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textMain} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <View style={styles.placeholderBox}>
              <Ionicons name="construct-outline" size={32} color={theme.colors.textSubtle} />
              <Text style={styles.placeholderText}>
                Future features and app settings will be added here in upcoming integrations.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 31, 24, 0.4)",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: theme.colors.background,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textMain,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  placeholderBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 40,
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
  },
  placeholderText: {
    color: theme.colors.textSubtle,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    fontSize: 14,
  },
});
