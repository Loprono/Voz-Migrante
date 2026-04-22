import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const PHRASES: Record<string, { es: string; en: string }[]> = {
  Doctor: [
    { es: "Tengo una cita a las...", en: "I have an appointment at..." },
    { es: "Necesito un intérprete en español.", en: "I need a Spanish interpreter." },
    { es: "Me duele aquí.", en: "It hurts here." },
    { es: "¿Cuándo debo tomar el medicamento?", en: "When should I take the medication?" },
    { es: "¿Cuánto cuesta esta consulta?", en: "How much does this visit cost?" },
    { es: "Por favor hable más despacio.", en: "Please speak more slowly." },
  ],
  Banco: [
    { es: "Quiero abrir una cuenta.", en: "I would like to open an account." },
    { es: "¿Cuánto debo pagar este mes?", en: "How much do I owe this month?" },
    { es: "Quiero disputar este cargo.", en: "I would like to dispute this charge." },
    { es: "¿Cuál es mi saldo disponible?", en: "What is my available balance?" },
    { es: "¿Tienen servicios en español?", en: "Do you have services in Spanish?" },
  ],
  Escuela: [
    { es: "Quiero inscribir a mi hijo.", en: "I would like to enroll my child." },
    { es: "¿Cuándo es la próxima junta?", en: "When is the next meeting?" },
    { es: "¿Tiene un intérprete disponible?", en: "Do you have an interpreter available?" },
    { es: "Mi hijo necesita ayuda especial.", en: "My child needs special assistance." },
    { es: "¿Cómo va mi hijo en la escuela?", en: "How is my child doing in school?" },
  ],
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onPhraseSelect?: (phrase: { es: string; en: string }) => void;
};

export function QuickPhrases({ visible, onClose, onPhraseSelect }: Props) {
  const [activeTab, setActiveTab] = useState("Doctor");

  const speakPhrase = (phrase: { es: string; en: string }) => {
    Speech.speak(phrase.en, { language: "en-US", rate: 0.85 });
    onPhraseSelect?.(phrase);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: "65%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary }}>
              Frases rápidas
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {Object.keys(PHRASES).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 100,
                  backgroundColor: activeTab === tab ? Colors.primary : Colors.background,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? Colors.white : Colors.textMuted,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {PHRASES[activeTab].map((phrase, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => speakPhrase(phrase)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor: Colors.background,
                  borderRadius: 12,
                  gap: 10,
                }}
              >
                <Ionicons name="volume-medium-outline" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.textPrimary, fontSize: 15, fontWeight: "500" }}>
                    {phrase.es}
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
                    {phrase.en}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
