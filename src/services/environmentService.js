const OPENWEATHER_BASE =
  "https://api.openweathermap.org/data/2.5/air_pollution";

export function getMockEnvironmentData(seed = 0) {
  const drift = (seed % 7) * 4;
  return {
    aqi: 65 + drift,
    pm25: 32 + drift,
    pm10: 54 + drift,
    dust: 45 + drift,
    chemicalIndex: 30 + drift,
    source: "mock",
  };
}

export function getMockForecast(current) {
  return {
    in30: {
      ...current,
      aqi: Math.max(30, current.aqi - 9),
      pm25: Math.max(12, current.pm25 - 6),
    },
    in60: {
      ...current,
      aqi: Math.max(28, current.aqi - 14),
      pm25: Math.max(10, current.pm25 - 10),
    },
    in120: {
      ...current,
      aqi: Math.max(24, current.aqi - 18),
      pm25: Math.max(8, current.pm25 - 12),
    },
    source: "mock",
  };
}

function mapOpenWeatherAqi(scale) {
  const table = {
    1: 25,
    2: 50,
    3: 85,
    4: 130,
    5: 180,
  };
  return table[scale] || 70;
}

export async function fetchEnvironmentAt({ lat, lng, apiKey, seed }) {
  console.log(`[FRONTEND] fetchEnvironmentAt called for lat: ${lat}, lng: ${lng}, hasApiKey: ${!!apiKey}`);

  if (!apiKey) {
    console.log('[FRONTEND] No API key, returning  data');
    return getMockEnvironmentData(seed);
  }

  try {
    const url = `${OPENWEATHER_BASE}?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    console.log(`[FRONTEND] Fetching from OpenWeather API: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[FRONTEND] OpenWeather API failed with status: ${response.status}`);
      throw new Error("Failed air pollution request");
    }

    const data = await response.json();
    console.log('[FRONTEND] Successfully received data from OpenWeather API');
    
    const item = data?.list?.[0];
    if (!item) {
      console.error('[FRONTEND] Missing payload in API response');
      throw new Error("Missing payload");
    }

    const result = {
      aqi: mapOpenWeatherAqi(item.main.aqi),
      pm25: item.components.pm2_5 || 0,
      pm10: item.components.pm10 || 0,
      dust: (item.components.pm10 || 0) * 0.9,
      chemicalIndex:
        ((item.components.no2 || 0) + (item.components.so2 || 0)) * 0.5,
      source: "api",
    };
    
    console.log('[FRONTEND] Processed environment data:', result);
    return result;
  } catch (error) {
    console.error('[FRONTEND] Error in fetchEnvironmentAt:', error.message);
    console.log('[FRONTEND] Falling back to mock data');
    return getMockEnvironmentData(seed);
  }
}

export async function fetchForecastAt({ lat, lng, apiKey, current }) {
  if (!apiKey) {
    return getMockForecast(current);
  }

  try {
    const url = `${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed forecast request");
    }

    const data = await response.json();
    const next = data?.list?.slice(0, 8) || [];
    if (!next.length) {
      throw new Error("Missing forecast items");
    }

    const readPoint = (index) => {
      const item = next[Math.min(index, next.length - 1)];
      return {
        aqi: mapOpenWeatherAqi(item.main.aqi),
        pm25: item.components.pm2_5 || 0,
        pm10: item.components.pm10 || 0,
        dust: (item.components.pm10 || 0) * 0.9,
        chemicalIndex:
          ((item.components.no2 || 0) + (item.components.so2 || 0)) * 0.5,
      };
    };

    return {
      in30: readPoint(1),
      in60: readPoint(2),
      in120: readPoint(4),
      source: "api",
    };
  } catch (error) {
    return getMockForecast(current);
  }
}
