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
  if (!apiKey) {
    return getMockEnvironmentData(seed);
  }

  try {
    const url = `${OPENWEATHER_BASE}?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed air pollution request");
    }

    const data = await response.json();
    const item = data?.list?.[0];
    if (!item) {
      throw new Error("Missing payload");
    }

    return {
      aqi: mapOpenWeatherAqi(item.main.aqi),
      pm25: item.components.pm2_5 || 0,
      pm10: item.components.pm10 || 0,
      dust: (item.components.pm10 || 0) * 0.9,
      chemicalIndex:
        ((item.components.no2 || 0) + (item.components.so2 || 0)) * 0.5,
      source: "api",
    };
  } catch (error) {
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
