import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { PrimaryButton } from "@/components/PrimaryButton";
import { analyzeDocument } from "@/lib/anthropic";

export default function ExplainScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu cámara para tomar foto del documento.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tus fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const analysis = await analyzeDocument(base64, "image/jpeg");
      router.push({
        pathname: "/explain/result",
        params: { analysis: JSON.stringify(analysis), imageUri },
      });
    } catch (error) {
      Alert.alert(
        "Algo salió mal",
        "No pudimos analizar el documento. Asegúrate de que la imagen sea clara y vuelve a intentarlo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Instructions */}
        <View
          style={{
            backgroundColor: Colors.primaryLight,
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.primary }}>
            Consejos para mejores resultados
          </Text>
          {[
            "Asegúrate de tener buena iluminación",
            "Incluye todo el documento en la foto",
            "Evita sombras o imágenes borrosas",
            "Mantén el documento plano y recto",
          ].map((tip, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} style={{ marginTop: 1 }} />
              <Text style={{ color: Colors.primary, fontSize: 14, flex: 1 }}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Image Preview */}
        {imageUri ? (
          <View style={{ gap: 12 }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 280, borderRadius: 16 }}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={() => setImageUri(null)} style={{ alignItems: "center" }}>
              <Text style={{ color: Colors.danger, fontSize: 15, fontWeight: "600" }}>
                Cambiar imagen
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={pickFromCamera}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.white,
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                gap: 12,
                borderWidth: 2,
                borderColor: Colors.border,
                borderStyle: "dashed",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: Colors.primaryLight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="camera" size={30} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
                Tomar foto
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textMuted, textAlign: "center" }}>
                Usa la cámara para fotografiar el documento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickFromGallery}
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.white,
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
                gap: 12,
                borderWidth: 2,
                borderColor: Colors.border,
                borderStyle: "dashed",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: Colors.primaryLight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="images" size={30} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
                Subir desde galería
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textMuted, textAlign: "center" }}>
                Elige una foto guardada en tu teléfono
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Analyze Button */}
        {imageUri && (
          <PrimaryButton
            label={loading ? "Analizando..." : "Explicar documento"}
            onPress={analyzeImage}
            loading={loading}
            disabled={loading}
          />
        )}

        {loading && (
          <View style={{ alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
              Un momento... estamos leyendo tu documento
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
