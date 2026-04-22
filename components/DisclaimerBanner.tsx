import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type Props = {
  type: "legal" | "medical";
};

const messages = {
  legal: "⚠️ Esto no es consejo legal. Te recomendamos hablar con un profesional certificado o una agencia oficial.",
  medical: "⚠️ Esto no es consejo médico. Consulta con tu médico para decisiones sobre tu salud.",
};

export function DisclaimerBanner({ type }: Props) {
  return (
    <View
      style={{
        backgroundColor: Colors.warningLight,
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
        borderRadius: 8,
        padding: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginVertical: 8,
      }}
    >
      <Ionicons name="warning-outline" size={20} color={Colors.warning} style={{ marginTop: 1 }} />
      <Text style={{ color: "#92400E", fontSize: 14, flex: 1, lineHeight: 20 }}>
        {messages[type]}
      </Text>
    </View>
  );
}
