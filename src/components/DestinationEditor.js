import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { theme } from "../constants/theme";

function hasBrowserSpeechRecognitionSupport() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export default function DestinationEditor({
  origin,
  onUpdateOrigin,
  destination,
  onUpdate,
  onAiHelp,
  onRequireLogin,
  isLoggedIn,
}) {
  const [sourceAddress, setSourceAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const activeVoiceFieldRef = useRef(activeVoiceField);
  const isWeb = Platform.OS === "web";
  const isSecureWebContext =
    !isWeb || (typeof window !== "undefined" && window.isSecureContext);
  const hasWebSpeechSupport = !isWeb || hasBrowserSpeechRecognitionSupport();

  const isVoiceInputSupported = isWeb
    ? hasWebSpeechSupport && isSecureWebContext
    : ExpoSpeechRecognitionModule.isRecognitionAvailable();

  useEffect(() => {
    activeVoiceFieldRef.current = activeVoiceField;
  }, [activeVoiceField]);

  useEffect(() => {
    if (isLoggedIn && sourceAddress.trim() && destAddress.trim()) {
      apply();
    }
  }, [isLoggedIn]);

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setActiveVoiceField(null);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    const field = activeVoiceFieldRef.current;

    if (!transcript || !field) {
      return;
    }

    if (field === "source") {
      setSourceAddress(transcript);
    } else {
      setDestAddress(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    setActiveVoiceField(null);

    if (event.error !== "aborted") {
      Alert.alert("Voice input error", event.message || "Unable to capture speech.");
    }
  });

  useEffect(() => {
    async function reverseGeocode() {
      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: destination.latitude,
          longitude: destination.longitude,
        });

        if (result && result.length > 0) {
          const place = result[0];
          const formatted = [place.name, place.street, place.city, place.region]
            .filter(Boolean)
            .join(", ");
          setDestAddress(formatted || `${destination.latitude}, ${destination.longitude}`);
        } else {
          setDestAddress(`${destination.latitude}, ${destination.longitude}`);
        }
      } catch (error) {
        setDestAddress(`${destination.latitude}, ${destination.longitude}`);
      }

      if (origin) {
        try {
          const result = await Location.reverseGeocodeAsync({
            latitude: origin.latitude,
            longitude: origin.longitude,
          });

          if (result && result.length > 0) {
            const place = result[0];
            const formatted = [place.name, place.street, place.city, place.region]
              .filter(Boolean)
              .join(", ");
            setSourceAddress(formatted || `${origin.latitude}, ${origin.longitude}`);
          } else {
            setSourceAddress(`${origin.latitude}, ${origin.longitude}`);
          }
        } catch (error) {
          setSourceAddress(`${origin.latitude}, ${origin.longitude}`);
        }
      }
    }

    reverseGeocode();
  }, [destination.latitude, destination.longitude, origin?.latitude, origin?.longitude]);

  async function startVoiceInput(field) {
    if (isListening && activeVoiceFieldRef.current === field) {
      ExpoSpeechRecognitionModule.abort();
      return;
    }

    if (isListening && activeVoiceFieldRef.current !== field) {
      Alert.alert("Voice input in progress", "Stop the current voice input before starting another field.");
      return;
    }

    if (isWeb && !hasWebSpeechSupport) {
      Alert.alert("Voice input unavailable", "Speech recognition is not supported in this browser.");
      return;
    }

    if (isWeb && !isSecureWebContext) {
      Alert.alert("Voice input unavailable", "Speech recognition requires a secure browser context (HTTPS or localhost).");
      return;
    }

    if (!isWeb && !ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      Alert.alert("Voice input unavailable", "Speech recognition is not available on this device.");
      return;
    }

    try {
      if (!isWeb) {
        const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!permission.granted) {
          Alert.alert("Permission required", "Allow microphone and speech recognition access to use voice input.");
          return;
        }
      }

      setActiveVoiceField(field);
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
      });
    } catch (error) {
      setActiveVoiceField(null);
      Alert.alert("Voice input error", error?.message || "Unable to start speech recognition.");
    }
  }

  async function apply() {
    if (!isLoggedIn) {
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }

    if (!destAddress.trim() || !sourceAddress.trim()) {
      Alert.alert("Missing Input", "Please provide both source and destination.");
      return;
    }

    setLoading(true);
    try {
      const destResult = await Location.geocodeAsync(destAddress);
      const sourceResult = await Location.geocodeAsync(sourceAddress);

      if (destResult && destResult.length > 0 && sourceResult && sourceResult.length > 0) {
        if (onUpdateOrigin) {
          onUpdateOrigin({ latitude: sourceResult[0].latitude, longitude: sourceResult[0].longitude });
        }
        onUpdate({ latitude: destResult[0].latitude, longitude: destResult[0].longitude });
      } else {
        Alert.alert("Location not found", "Could not find either source or destination.");
      }
    } catch (error) {
      Alert.alert("Error finding location", error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAiHelp() {
    if (onAiHelp) onAiHelp();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Locations</Text>
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={sourceAddress}
            onChangeText={setSourceAddress}
            placeholder="Source (e.g. MG Road)"
          />
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isListening && activeVoiceField === "source" && styles.voiceButtonActive,
            ]}
            onPress={() => startVoiceInput("source")}
            accessibilityRole="button"
            accessibilityLabel="Use voice input for source"
          >
            <Ionicons
              name={isListening && activeVoiceField === "source" ? "mic" : "mic-outline"}
              size={18}
              color={isListening && activeVoiceField === "source" ? "#FFFFFF" : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={destAddress}
            onChangeText={setDestAddress}
            placeholder="Destination (e.g. Bangalore Palace)"
          />
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isListening && activeVoiceField === "destination" && styles.voiceButtonActive,
            ]}
            onPress={() => startVoiceInput("destination")}
            accessibilityRole="button"
            accessibilityLabel="Use voice input for destination"
          >
            <Ionicons
              name={isListening && activeVoiceField === "destination" ? "mic" : "mic-outline"}
              size={18}
              color={isListening && activeVoiceField === "destination" ? "#FFFFFF" : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={apply}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonTextPrimary}>Update Destination</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonGhost} onPress={handleAiHelp}>
          <Text style={styles.buttonTextGhost}>AI Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panel,
    padding: 12,
  },
  title: {
    color: theme.colors.textMain,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FAFCF8",
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#F3F9EF",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  buttonPrimary: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    paddingVertical: 10,
  },
  buttonTextPrimary: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  buttonGhost: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#F3F9EF",
  },
  buttonTextGhost: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
});
