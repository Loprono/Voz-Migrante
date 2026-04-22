import React, { useState } from "react";
import { TouchableOpacity, Text, View, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type Props = {
  term: string;
  explanation: string;
};

export function TermChip({ term, explanation }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          backgroundColor: Colors.primaryLight,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          margin: 4,
          borderWidth: 1,
          borderColor: Colors.primary,
        }}
      >
        <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600" }}>
          {term}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}
          onPress={() => setVisible(false)}
        >
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.primary }}>
                "{term}"
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24 }}>
              {explanation}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
