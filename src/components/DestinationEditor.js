import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { theme } from "../constants/theme";

export default function DestinationEditor({ origin, onUpdateOrigin, destination, onUpdate, onAiHelp }) {
  const [sourceAddress, setSourceAddress] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function apply() {
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
        <TextInput
          style={styles.input}
          value={sourceAddress}
          onChangeText={setSourceAddress}
          placeholder="Source (e.g. MG Road)"
        />
        <TextInput
          style={styles.input}
          value={destAddress}
          onChangeText={setDestAddress}
          placeholder="Destination (e.g. Bangalore Palace)"
        />
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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FAFCF8",
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
