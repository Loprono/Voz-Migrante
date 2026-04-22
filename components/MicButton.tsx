import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Animated, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type Props = {
  isRecording: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  size?: number;
  color?: string;
};

export function MicButton({
  isRecording,
  onPressIn,
  onPressOut,
  size = 80,
  color = Colors.primary,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.8}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isRecording ? Colors.danger : color,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: isRecording ? Colors.danger : color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={size * 0.4}
          color={Colors.white}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
