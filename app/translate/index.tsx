import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
} from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { MicButton } from "@/components/MicButton";
import { QuickPhrases } from "@/components/QuickPhrases";
import { translateText } from "@/lib/anthropic";

type TranscriptEntry = {
  id: string;
  original: string;
  translated: string;
  direction: "es-en" | "en-es";
};

export default function TranslateScreen() {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [recordingEs, setRecordingEs] = useState(false);
  const [recordingEn, setRecordingEn] = useState(false);
  const [slowSpeech, setSlowSpeech] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const [processingEs, setProcessingEs] = useState(false);
  const [processingEn, setProcessingEn] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso al micrófono para la traducción en vivo. Por favor actívalo en Configuración."
      );
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    const granted = await requestMicPermission();
    if (!granted) return null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recordingRef.current = recording;
    return recording;
  };

  const stopAndTranscribe = async (
    direction: "es-en" | "en-es",
    setProcessing: (v: boolean) => void
  ) => {
    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      setProcessing(true);

      // NOTE: Real STT requires a backend service (Whisper/Google STT).
      // This demo uses a placeholder. In production, POST the audio file
      // to your API endpoint and return the transcript.
      const transcript = await mockTranscribe(direction);

      const translation = await translateText(transcript, direction);

      const entry: TranscriptEntry = {
        id: Date.now().toString(),
        original: transcript,
        translated: translation,
        direction,
      };

      setEntries((prev) => [...prev, entry]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      // Auto-play translation
      const lang = direction === "es-en" ? "en-US" : "es-US";
      Speech.speak(translation, { language: lang, rate: slowSpeech ? 0.75 : 0.95 });
    } catch (error) {
      Alert.alert("Error", "No pudimos procesar el audio. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  // Placeholder until real STT backend is wired up
  const mockTranscribe = async (direction: "es-en" | "en-es"): Promise<string> => {
    await new Promise((r) => setTimeout(r, 800));
    return direction === "es-en"
      ? "Hola, ¿me puede ayudar con mi cuenta?"
      : "Your account balance is $245.";
  };

  const handleEsPressIn = async () => {
    setRecordingEs(true);
    await startRecording();
  };

  const handleEsPressOut = async () => {
    setRecordingEs(false);
    await stopAndTranscribe("es-en", setProcessingEs);
  };

  const handleEnPressIn = async () => {
    setRecordingEn(true);
    await startRecording();
  };

  const handleEnPressOut = async () => {
    setRecordingEn(false);
    await stopAndTranscribe("en-es", setProcessingEn);
  };

  const repeatLastTranslation = () => {
    const last = entries[entries.length - 1];
    if (!last) return;
    const lang = last.direction === "es-en" ? "en-US" : "es-US";
    Speech.speak(last.translated, { language: lang, rate: slowSpeech ? 0.75 : 0.95 });
  };

  const speakEntry = (entry: TranscriptEntry) => {
    const lang = entry.direction === "es-en" ? "en-US" : "es-US";
    Speech.speak(entry.translated, { language: lang, rate: slowSpeech ? 0.75 : 0.95 });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["bottom"]}>
      <View style={{ flex: 1 }}>

        {/* Spanish Panel */}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            margin: 12,
            marginBottom: 6,
            borderRadius: 20,
            padding: 16,
            borderWidth: 2,
            borderColor: recordingEs ? Colors.primary : Colors.border,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: recordingEs ? 0.2 : 0.05,
            shadowRadius: 8,
            elevation: recordingEs ? 6 : 2,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 22 }}>🇲🇽</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
                Tú — Español
              </Text>
            </View>
            {processingEs && (
              <Text style={{ color: Colors.primary, fontSize: 13 }}>Traduciendo...</Text>
            )}
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {entries
              .filter((e) => e.direction === "es-en")
              .slice(-3)
              .map((e) => (
                <View key={e.id} style={{ marginBottom: 8 }}>
                  <Text style={{ color: Colors.textMuted, fontSize: 13 }}>{e.original}</Text>
                  <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600", marginTop: 2 }}>
                    → {e.translated}
                  </Text>
                </View>
              ))}
            {entries.filter((e) => e.direction === "es-en").length === 0 && (
              <Text style={{ color: Colors.textMuted, fontSize: 14, fontStyle: "italic" }}>
                Mantén presionado el micrófono y habla en español...
              </Text>
            )}
          </ScrollView>

          <View style={{ alignItems: "center", marginTop: 12 }}>
            <MicButton
              isRecording={recordingEs}
              onPressIn={handleEsPressIn}
              onPressOut={handleEsPressOut}
              color={Colors.primary}
            />
            <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 8 }}>
              {recordingEs ? "Suelta para traducir" : "Mantén presionado para hablar"}
            </Text>
          </View>
        </View>

        {/* English Panel */}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            margin: 12,
            marginTop: 6,
            borderRadius: 20,
            padding: 16,
            borderWidth: 2,
            borderColor: recordingEn ? Colors.accent : Colors.border,
            shadowColor: Colors.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: recordingEn ? 0.2 : 0.05,
            shadowRadius: 8,
            elevation: recordingEn ? 6 : 2,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 22 }}>🇺🇸</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
                Ellos — English
              </Text>
            </View>
            {processingEn && (
              <Text style={{ color: Colors.accent, fontSize: 13 }}>Translating...</Text>
            )}
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {entries
              .filter((e) => e.direction === "en-es")
              .slice(-3)
              .map((e) => (
                <TouchableOpacity key={e.id} onPress={() => speakEntry(e)} style={{ marginBottom: 8 }}>
                  <Text style={{ color: Colors.textMuted, fontSize: 13 }}>{e.original}</Text>
                  <Text style={{ color: Colors.accent, fontSize: 14, fontWeight: "600", marginTop: 2 }}>
                    → {e.translated}
                  </Text>
                </TouchableOpacity>
              ))}
            {entries.filter((e) => e.direction === "en-es").length === 0 && (
              <Text style={{ color: Colors.textMuted, fontSize: 14, fontStyle: "italic" }}>
                Hold the mic and let them speak in English...
              </Text>
            )}
          </ScrollView>

          <View style={{ alignItems: "center", marginTop: 12 }}>
            <MicButton
              isRecording={recordingEn}
              onPressIn={handleEnPressIn}
              onPressOut={handleEnPressOut}
              color={Colors.accent}
            />
            <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 8 }}>
              {recordingEn ? "Release to translate" : "Hold to record English"}
            </Text>
          </View>
        </View>

        {/* Controls Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            gap: 8,
          }}
        >
          {/* Slow speech toggle */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="timer-outline" size={20} color={Colors.textMuted} />
            <Text style={{ fontSize: 13, color: Colors.textMuted }}>Lento</Text>
            <Switch
              value={slowSpeech}
              onValueChange={setSlowSpeech}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          {/* Repeat last */}
          <TouchableOpacity
            onPress={repeatLastTranslation}
            disabled={entries.length === 0}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: entries.length > 0 ? Colors.primaryLight : Colors.background,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 100,
            }}
          >
            <Ionicons name="repeat" size={18} color={entries.length > 0 ? Colors.primary : Colors.textMuted} />
            <Text style={{ fontSize: 13, color: entries.length > 0 ? Colors.primary : Colors.textMuted, fontWeight: "600" }}>
              Repetir
            </Text>
          </TouchableOpacity>

          {/* Quick phrases */}
          <TouchableOpacity
            onPress={() => setShowPhrases(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: Colors.accentLight,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 100,
            }}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={Colors.accent} />
            <Text style={{ fontSize: 13, color: Colors.accent, fontWeight: "600" }}>
              Frases
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <QuickPhrases
        visible={showPhrases}
        onClose={() => setShowPhrases(false)}
        onPhraseSelect={(phrase) => {
          const entry: TranscriptEntry = {
            id: Date.now().toString(),
            original: phrase.es,
            translated: phrase.en,
            direction: "es-en",
          };
          setEntries((prev) => [...prev, entry]);
        }}
      />
    </SafeAreaView>
  );
}
