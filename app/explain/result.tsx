import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { TermChip } from "@/components/TermChip";
import { PrimaryButton } from "@/components/PrimaryButton";
import { DocumentAnalysis, askAboutDocument } from "@/lib/anthropic";
import { saveToHistory } from "@/lib/supabase";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const analysis: DocumentAnalysis = JSON.parse(params.analysis as string);

  const [activeTab, setActiveTab] = useState<"resumen" | "puntos" | "pasos">("resumen");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const speakSummary = async () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(analysis.resumen, {
      language: "es-US",
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  };

  const speakStep = (step: string) => {
    Speech.speak(step, { language: "es-US", rate: 0.9 });
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setAskingQuestion(true);
    try {
      const context = `Resumen: ${analysis.resumen}. Puntos: ${analysis.puntos_importantes.map((p) => `${p.label}: ${p.value}`).join(", ")}`;
      const response = await askAboutDocument(question, context);
      setAnswer(response);
    } catch {
      Alert.alert("Error", "No pudimos responder tu pregunta. Intenta de nuevo.");
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveToHistory({
        type: "document",
        title: analysis.puntos_importantes[0]?.value ?? "Documento analizado",
        category: analysis.disclaimer === "medical" ? "doctor" : analysis.disclaimer === "legal" ? "legal" : "otro",
        content: JSON.stringify(analysis),
      });
      setSaved(true);
    } catch {
      Alert.alert("Error", "No se pudo guardar. Verifica tu conexión.");
    }
  };

  const tabs = [
    { key: "resumen", label: "Resumen" },
    { key: "puntos", label: "Puntos clave" },
    { key: "pasos", label: "Qué hacer" },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>

        {/* Disclaimer */}
        {analysis.disclaimer && <DisclaimerBanner type={analysis.disclaimer} />}

        {/* Tab Navigation */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: Colors.white,
            borderRadius: 12,
            padding: 4,
            gap: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: activeTab === tab.key ? Colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  color: activeTab === tab.key ? Colors.white : Colors.textMuted,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumen Tab */}
        {activeTab === "resumen" && (
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              gap: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
                Resumen rápido
              </Text>
              <TouchableOpacity onPress={speakSummary}>
                <Ionicons
                  name={speaking ? "stop-circle" : "volume-medium"}
                  size={26}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 26 }}>
              {analysis.resumen}
            </Text>

            {analysis.terminos_clave.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.textMuted }}>
                  Toca un término para entenderlo:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {analysis.terminos_clave.map((t, i) => (
                    <TermChip key={i} term={t.term} explanation={t.explicacion} />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Puntos clave Tab */}
        {activeTab === "puntos" && (
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              gap: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
              Puntos importantes
            </Text>
            {analysis.puntos_importantes.map((punto, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: i < analysis.puntos_importantes.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                  gap: 12,
                }}
              >
                <Text style={{ fontSize: 15, color: Colors.textMuted, flex: 1 }}>
                  {punto.label}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary, textAlign: "right", flex: 1 }}>
                  {punto.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Siguientes pasos Tab */}
        {activeTab === "pasos" && (
          <View
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              gap: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
              ¿Qué debes hacer?
            </Text>
            {analysis.siguientes_pasos.map((paso, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => speakStep(paso)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  backgroundColor: Colors.background,
                  padding: 14,
                  borderRadius: 12,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: Colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ color: Colors.white, fontWeight: "700", fontSize: 13 }}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, color: Colors.textPrimary, flex: 1, lineHeight: 22 }}>
                  {paso}
                </Text>
                <Ionicons name="volume-low-outline" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
            <Text style={{ color: Colors.textMuted, fontSize: 12, textAlign: "center" }}>
              Toca cualquier paso para escucharlo en voz alta
            </Text>
          </View>
        )}

        {/* Ask by voice */}
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 16,
            padding: 20,
            gap: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
            ¿Tienes alguna pregunta?
          </Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Ej: ¿Qué significa la fecha de vencimiento?"
            placeholderTextColor={Colors.textMuted}
            multiline
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              color: Colors.textPrimary,
              minHeight: 56,
            }}
          />
          <PrimaryButton
            label={askingQuestion ? "Buscando respuesta..." : "Preguntar"}
            onPress={handleAskQuestion}
            loading={askingQuestion}
            disabled={!question.trim() || askingQuestion}
            variant="secondary"
          />
          {answer && (
            <View
              style={{
                backgroundColor: Colors.accentLight,
                borderRadius: 12,
                padding: 14,
                gap: 6,
              }}
            >
              <Text style={{ fontWeight: "700", color: Colors.accent, fontSize: 14 }}>
                Respuesta:
              </Text>
              <Text style={{ color: "#065F46", fontSize: 15, lineHeight: 22 }}>
                {answer}
              </Text>
            </View>
          )}
        </View>

        {/* Save */}
        <PrimaryButton
          label={saved ? "✓ Guardado en historial" : "Guardar en historial"}
          onPress={handleSave}
          disabled={saved}
          variant={saved ? "accent" : "primary"}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
