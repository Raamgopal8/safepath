import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { theme } from "../constants/theme";

const ChatMessage = ({ message, isUser }) => (
  <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
    <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>
      {message.text}
    </Text>
    {message.voiceEnabled && (
      <TouchableOpacity
        style={styles.voiceButton}
        onPress={() => Speech.speak(message.text, { rate: 0.9, pitch: 1.0 })}
      >
        <Ionicons name="volume-high" size={16} color={theme.colors.primary} />
      </TouchableOpacity>
    )}
  </View>
);

const QuickAction = ({ action, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <Text style={styles.quickActionText}>{action.label}</Text>
  </TouchableOpacity>
);

export default function Chatbot({
  healthProfile,
  onUpdateHealthProfile,
  routes,
  activeRoute,
  recommendation,
  alerts,
  onRouteSelect,
  onClose
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your SafePath AI assistant. I can help you with health-conscious route planning. Would you like me to analyze your current health profile or suggest safer routes?",
      isUser: false,
      voiceEnabled: true,
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState("greeting");
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const addMessage = (text, isUser = false, voiceEnabled = false) => {
    const newMessage = {
      id: Date.now(),
      text,
      isUser,
      voiceEnabled,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const simulateTyping = async (callback) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    callback();
  };

  const handleUserInput = async (text) => {
    if (!text.trim()) return;

    addMessage(text, true);
    setInputText("");

    const lowerText = text.toLowerCase();

    // Analyze user intent and respond accordingly
    if (conversationState === "greeting") {
      if (lowerText.includes("health") || lowerText.includes("profile") || lowerText.includes("condition")) {
        await simulateTyping(() => {
          addMessage(`I see you want to discuss your health profile. Your current settings are: ${healthProfile.condition} condition with ${healthProfile.sensitivity} sensitivity. Would you like me to help you update these settings or analyze how they affect your route choices?`, false, true);
          setConversationState("health_analysis");
        });
      } else if (lowerText.includes("route") || lowerText.includes("suggest") || lowerText.includes("safe")) {
        await simulateTyping(() => {
          const response = generateRouteAnalysis();
          addMessage(response, false, true);
          setConversationState("route_analysis");
        });
      } else {
        await simulateTyping(() => {
          addMessage("I can help you with health profile setup, route analysis, or safety recommendations. What would you like to know?", false, true);
        });
      }
    } else if (conversationState === "health_analysis") {
      if (lowerText.includes("update") || lowerText.includes("change")) {
        await simulateTyping(() => {
          addMessage("Let's update your health profile. What medical condition should I set for you? Options include: Normal, Asthma, Allergy, COPD, Bronchitis, Heart Disease, Pregnant, Elderly, or Children.", false, true);
          setConversationState("updating_condition");
        });
      } else if (lowerText.includes("analyze") || lowerText.includes("affect")) {
        await simulateTyping(() => {
          const analysis = analyzeHealthImpact();
          addMessage(analysis, false, true);
        });
      }
    } else if (conversationState === "updating_condition") {
      const conditions = ["Normal", "Asthma", "Allergy", "COPD", "Bronchitis", "Heart Disease", "Pregnant", "Elderly", "Children"];
      const matchedCondition = conditions.find(c => lowerText.includes(c.toLowerCase()));

      if (matchedCondition) {
        onUpdateHealthProfile({ ...healthProfile, condition: matchedCondition });
        await simulateTyping(() => {
          addMessage(`Updated your condition to ${matchedCondition}. Now, what's your sensitivity level? Low, Medium, or High?`, false, true);
          setConversationState("updating_sensitivity");
        });
      } else {
        await simulateTyping(() => {
          addMessage("I didn't recognize that condition. Please choose from: Normal, Asthma, Allergy, COPD, Bronchitis, Heart Disease, Pregnant, Elderly, or Children.", false, true);
        });
      }
    } else if (conversationState === "updating_sensitivity") {
      const sensitivities = ["Low", "Medium", "High"];
      const matchedSensitivity = sensitivities.find(s => lowerText.includes(s.toLowerCase()));

      if (matchedSensitivity) {
        onUpdateHealthProfile({ ...healthProfile, sensitivity: matchedSensitivity });
        await simulateTyping(() => {
          addMessage(`Perfect! Your profile is now set to ${healthProfile.condition} with ${matchedSensitivity} sensitivity. This will help me provide more accurate route recommendations. Would you like me to analyze routes for you now?`, false, true);
          setConversationState("route_analysis");
        });
      } else {
        await simulateTyping(() => {
          addMessage("Please specify Low, Medium, or High sensitivity.", false, true);
        });
      }
    } else if (conversationState === "route_analysis") {
      if (lowerText.includes("analyze") || lowerText.includes("explain") || lowerText.includes("why")) {
        await simulateTyping(() => {
          const explanation = explainRouteDangers();
          addMessage(explanation, false, true);
        });
      } else if (lowerText.includes("switch") || lowerText.includes("change")) {
        await simulateTyping(() => {
          const suggestion = suggestRouteSwitch();
          addMessage(suggestion, false, true);
        });
      } else {
        await simulateTyping(() => {
          addMessage("I can explain why certain routes might be dangerous for your health condition, or help you switch to a safer route. What would you like to do?", false, true);
        });
      }
    }
  };

  const generateRouteAnalysis = () => {
    if (!activeRoute || !routes.length) {
      return "I need route data to provide analysis. Please set your destination first.";
    }

    const healthiestRoute = routes.find(r => r.id === 'r2'); // Healthiest route
    const fastestRoute = routes.find(r => r.id === 'r1'); // Fastest route

    let analysis = `Based on your ${healthProfile.condition} condition and ${healthProfile.sensitivity} sensitivity, here's my analysis:\n\n`;

    if (activeRoute.id === healthiestRoute.id) {
      analysis += `✅ You're currently on the safest route (${activeRoute.name}). `;
      analysis += `This route has a ${activeRoute.risk.label} risk level with AQI ${Math.round(activeRoute.environment.aqi)}. `;
    } else {
      analysis += `⚠️ Your current route (${activeRoute.name}) has higher pollution exposure. `;
      analysis += `The healthiest route (${healthiestRoute.name}) would reduce your exposure by approximately ${Math.round((activeRoute.pollutionIndex - healthiestRoute.pollutionIndex) / activeRoute.pollutionIndex * 100)}%. `;
    }

    analysis += `\n\nWould you like me to explain the specific health risks or help you switch to a safer route?`;

    return analysis;
  };

  const analyzeHealthImpact = () => {
    if (!activeRoute) return "Please select a route first.";

    const riskFactors = [];

    if (activeRoute.environment.aqi > 70) {
      riskFactors.push("high air pollution");
    }
    if (activeRoute.environment.pm25 > 35) {
      riskFactors.push("elevated PM2.5 particles");
    }
    if (activeRoute.environment.chemicalIndex > 45) {
      riskFactors.push("chemical irritants");
    }

    let impact = `For someone with ${healthProfile.condition}, this route presents `;

    if (riskFactors.length === 0) {
      impact += "minimal health risks. The air quality is generally acceptable.";
    } else {
      impact += `the following concerns: ${riskFactors.join(", ")}. `;

      if (["Asthma", "COPD", "Bronchitis"].includes(healthProfile.condition)) {
        impact += "This could trigger respiratory symptoms or reduce lung function.";
      } else if (["Heart Disease"].includes(healthProfile.condition)) {
        impact += "This may increase cardiovascular stress and blood pressure.";
      } else if (["Pregnant", "Children", "Elderly"].includes(healthProfile.condition)) {
        impact += "This poses higher risks for vulnerable groups.";
      }
    }

    return impact;
  };

  const explainRouteDangers = () => {
    if (!routes.length) return "No route data available.";

    const dangerousRoutes = routes.filter(r => r.risk.label === "Risky");
    const moderateRoutes = routes.filter(r => r.risk.label === "Moderate");

    let explanation = "Here's why certain routes might be dangerous for your health condition:\n\n";

    dangerousRoutes.forEach(route => {
      explanation += `🔴 ${route.name}: `;
      if (route.environment.aqi > 100) {
        explanation += "Severely polluted air ";
      }
      if (route.trafficScore > 70) {
        explanation += "with heavy traffic exposure ";
      }
      explanation += `could ${getHealthRiskDescription(healthProfile.condition)}.\n\n`;
    });

    moderateRoutes.forEach(route => {
      explanation += `🟡 ${route.name}: `;
      explanation += "Moderate pollution levels that may still cause discomfort for sensitive individuals.\n\n";
    });

    explanation += "The safest route avoids these risk factors by choosing paths with better air quality and less traffic congestion.";

    return explanation;
  };

  const suggestRouteSwitch = () => {
    const healthiestRoute = routes.find(r => r.id === 'r2');
    if (!healthiestRoute || activeRoute.id === healthiestRoute.id) {
      return "You're already on the safest available route!";
    }

    return `I recommend switching to the ${healthiestRoute.name}. This route reduces your pollution exposure by ${Math.round((activeRoute.pollutionIndex - healthiestRoute.pollutionIndex) / activeRoute.pollutionIndex * 100)}% and takes only ${healthiestRoute.durationMin - activeRoute.durationMin} minutes longer. Would you like me to select this route for you?`;
  };

  const getHealthRiskDescription = (condition) => {
    const risks = {
      "Asthma": "trigger asthma attacks or breathing difficulties",
      "COPD": "worsen breathing problems and lung function",
      "Bronchitis": "cause chest tightness and coughing",
      "Heart Disease": "increase risk of heart attacks or chest pain",
      "Allergy": "trigger allergic reactions and sinus issues",
      "Pregnant": "affect fetal development and cause pregnancy complications",
      "Elderly": "lead to respiratory infections and cardiovascular issues",
      "Children": "impair lung development and cause respiratory problems",
      "Normal": "cause general discomfort and reduced well-being"
    };
    return risks[condition] || "cause health discomfort";
  };

  const quickActions = [
    { label: "Analyze my health profile", action: "health" },
    { label: "Suggest safer routes", action: "routes" },
    { label: "Explain route dangers", action: "dangers" },
    { label: "Switch to safest route", action: "switch" },
  ];

  const handleQuickAction = (action) => {
    let message = "";
    switch (action) {
      case "health":
        message = "Tell me about my health profile";
        break;
      case "routes":
        message = "Suggest safer routes for me";
        break;
      case "dangers":
        message = "Why are some routes dangerous?";
        break;
      case "switch":
        message = "Switch to the safest route";
        break;
    }
    handleUserInput(message);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>SafePath AI Assistant</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} isUser={message.isUser} />
        ))}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>AI is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickActionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              action={action}
              onPress={() => handleQuickAction(action.action)}
            />
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.textSubtle}
            onSubmitEditing={() => handleUserInput(inputText)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleUserInput(inputText)}
          >
            <Ionicons name="send" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(45, 156, 99, 0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textMain,
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F8F5",
    borderWidth: 1,
    borderColor: "rgba(45, 156, 99, 0.1)",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "white",
  },
  botMessageText: {
    color: theme.colors.textMain,
  },
  voiceButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
  typingIndicator: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F8F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginVertical: 4,
  },
  typingText: {
    color: theme.colors.textSubtle,
    fontSize: 14,
    fontStyle: "italic",
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(45, 156, 99, 0.1)",
  },
  quickAction: {
    backgroundColor: "rgba(45, 156, 99, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickActionText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(45, 156, 99, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textMain,
    paddingVertical: 4,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
});</content>
<parameter name="filePath">d:\safepath\src\components\Chatbot.js