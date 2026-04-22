import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: Props) {
  const bgColor =
    variant === "primary"
      ? Colors.primary
      : variant === "accent"
      ? Colors.accent
      : variant === "secondary"
      ? Colors.primaryLight
      : "transparent";

  const textColor =
    variant === "ghost" || variant === "secondary" ? Colors.primary : Colors.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          backgroundColor: disabled ? "#D1D5DB" : bgColor,
          borderRadius: 100,
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 56,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontSize: 18, fontWeight: "700" }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
