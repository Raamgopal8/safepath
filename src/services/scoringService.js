const SENSITIVITY_MULTIPLIER = {
  Low: 0.8,
  Medium: 1,
  High: 1.25,
};

const CONDITION_MULTIPLIER = {
  Normal: 1,
  Pregnant: 1.15,
  Allergy: 1.18,
  Elderly: 1.2,
  Children: 1.2,
  "Heart Disease": 1.25,
  Bronchitis: 1.3,
  Asthma: 1.35,
  COPD: 1.45,
};

export function classifyRisk(score) {
  if (score < 55) {
    return { label: "Safe", color: "#2D9C63", emoji: "🟢" };
  }
  if (score < 85) {
    return { label: "Moderate", color: "#D0841F", emoji: "🟡" };
  }
  return { label: "Risky", color: "#C53F3F", emoji: "🔴" };
}

export function scoreRoute(route, profile) {
  const sens = SENSITIVITY_MULTIPLIER[profile?.sensitivity || "Medium"] || 1;
  const cond = CONDITION_MULTIPLIER[profile?.condition || "Normal"] || 1;

  const environmentLoad =
    route.environment.aqi * 0.35 +
    route.environment.pm25 * 0.3 +
    route.environment.pm10 * 0.15 +
    route.environment.dust * 0.1 +
    route.environment.chemicalIndex * 0.1;

  const trafficPenalty = route.trafficScore * 0.18;
  const greenBonus = route.greeneryScore * 0.22;
  const timePenalty = route.durationMin * 0.6;

  const raw =
    (environmentLoad + trafficPenalty + timePenalty - greenBonus) * sens * cond;
  const score = Math.max(10, Math.round(raw));
  const risk = classifyRisk(score);

  return {
    ...route,
    healthScore: score,
    risk,
    pollutionIndex: Math.round(environmentLoad),
  };
}

export function rankRoutes(scoredRoutes) {
  const byHealth = [...scoredRoutes].sort(
    (a, b) => a.healthScore - b.healthScore,
  );
  const byTime = [...scoredRoutes].sort(
    (a, b) => a.durationMin - b.durationMin,
  );
  return {
    healthiest: byHealth[0],
    fastest: byTime[0],
  };
}

export function computeImpactMetrics({ healthiest, fastest }) {
  if (!healthiest || !fastest) {
    return { exposureReduction: 0, improvement: 0 };
  }

  const exposureReduction = Math.max(
    0,
    Math.round(
      ((fastest.pollutionIndex - healthiest.pollutionIndex) /
        Math.max(1, fastest.pollutionIndex)) *
        100,
    ),
  );

  const improvement = Math.max(
    0,
    Math.round(
      ((fastest.healthScore - healthiest.healthScore) /
        Math.max(1, fastest.healthScore)) *
        100,
    ),
  );

  return { exposureReduction, improvement };
}
