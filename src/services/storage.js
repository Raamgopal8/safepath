import AsyncStorage from "@react-native-async-storage/async-storage";

const HEALTH_PROFILE_KEY = "@safepath_health_profile";

export async function loadHealthProfile() {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export async function saveHealthProfile(profile) {
  try {
    await AsyncStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    // No-op for demo stability.
  }
}
