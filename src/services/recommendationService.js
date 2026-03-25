export function generateSafetySuggestions(route, profile) {
  const tips = [];

  if (route.environment.pm25 > 35 || route.environment.dust > 50) {
    tips.push("Wear a mask on this route.");
  }

  if (route.environment.chemicalIndex > 45) {
    tips.push("High chemical irritants detected. Keep windows closed.");
  }

  const respiratoryConditions = ["Asthma", "COPD", "Bronchitis", "Allergy"];
  if (respiratoryConditions.includes(profile.condition) && route.environment.aqi > 70) {
    tips.push(`Carry necessary medication. High pollution may trigger ${profile.condition.toLowerCase()} discomfort.`);
  }

  if (["Pregnant", "Children", "Elderly", "Heart Disease"].includes(profile.condition) && route.environment.aqi > 80) {
    tips.push("Vulnerable group alert. Avoid prolonged physical exertion outdoors.");
  }

  if (!tips.length) {
    tips.push("Air conditions are manageable for your profile.");
  }

  return tips;
}

export function buildAiRecommendation({ selectedRoute, healthiestRoute, profile }) {
  if (!selectedRoute || !healthiestRoute) {
    return "Collecting route conditions...";
  }

  const isSelectedHealthiest = selectedRoute.id === healthiestRoute.id;
  if (isSelectedHealthiest) {
    return `${selectedRoute.name} is mathematically the safest option for ${profile.condition.toLowerCase()} users.`;
  }

  return `Warning: ${selectedRoute.name} exposes you to higher pollution (AQI ${Math.round(
    selectedRoute.environment.aqi,
  )}). Strongly consider ${healthiestRoute.name} for ${profile.condition.toLowerCase()} safety.`;
}

export function emergencyMessage(route, profile) {
  if (!route) {
    return null;
  }

  const threshold = profile.sensitivity === "High" ? 75 : 95;
  if (route.environment.aqi > threshold) {
    return "Unsafe conditions for sensitive users. Delay travel or use a protected commute.";
  }

  return null;
}

export function simulateScenarios({ activeRoute }) {
  if (!activeRoute || !activeRoute.forecast) {
    return null;
  }

  const forecast = activeRoute.forecast;
  const delayedExposure = Math.max(
    20,
    Math.round((activeRoute.pollutionIndex + forecast.in60.pm25) * 0.45),
  );

  return {
    fastestNow: {
      title: `Take ${activeRoute.name} Now`,
      exposure: activeRoute.pollutionIndex,
      eta: activeRoute.durationMin,
      note: "Current live conditions on this path.",
    },
    healthiestNow: {
      title: "Delay 30 Minutes",
      exposure: delayedExposure,
      eta: activeRoute.durationMin + 30,
      note: "Forecasted PM2.5 shows cleaner air soon.",
    },
    delay30: {
      title: "Delay 60 Minutes",
      exposure: Math.max(20, Math.round((activeRoute.pollutionIndex + forecast.in120.pm25) * 0.4)),
      eta: activeRoute.durationMin + 60,
      note: "Highest safety expected if you wait an hour.",
    },
  };
}
