import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { getHistory, HistoryItem } from "@/lib/supabase";

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  doctor: "medical-outline",
  banco: "card-outline",
  escuela: "school-outline",
  legal: "document-text-outline",
  otro: "document-outline",
};

export default function HomeScreen() {
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecent = async () => {
    try {
      const items = await getHistory();
      setRecent(items.slice(0, 3));
    } catch {
      // history unavailable — offline or no supabase config
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecent();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 20,
            padding: 24,
            gap: 8,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 26, fontWeight: "800", lineHeight: 32 }}>
            Hola 👋
          </Text>
          <Text style={{ color: "#BFDBFE", fontSize: 15, lineHeight: 22 }}>
            Estamos aquí para ayudarte. Vamos paso a paso.
          </Text>
        </View>

        {/* Primary Actions */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
            ¿Qué necesitas hoy?
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/explain")}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
              borderWidth: 2,
              borderColor: Colors.primaryLight,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: Colors.primaryLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="document-text" size={28} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary }}>
                Explicar un documento
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textMuted, marginTop: 2 }}>
                Cartas, facturas, avisos médicos...
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/translate")}
            activeOpacity={0.85}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
              borderWidth: 2,
              borderColor: Colors.accentLight,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: Colors.accentLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="mic" size={28} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary }}>
                Traducir en vivo
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textMuted, marginTop: 2 }}>
                Habla español, escucha inglés al instante
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Reassurance card */}
        <View
          style={{
            backgroundColor: "#ECFDF5",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.accent} />
          <Text style={{ color: "#065F46", fontSize: 14, flex: 1 }}>
            No te preocupes. Todo lo que compartes es privado y seguro.
          </Text>
        </View>

        {/* Recent */}
        {recent.length > 0 && (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
                Recientes
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
                <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600" }}>
                  Ver todo
                </Text>
              </TouchableOpacity>
            </View>

            {recent.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: 12,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons
                  name={CATEGORY_ICONS[item.category] ?? "document-outline"}
                  size={22}
                  color={Colors.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.textPrimary }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
                    {item.type === "document" ? "Documento" : "Traducción"} •{" "}
                    {new Date(item.created_at).toLocaleDateString("es-US")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
