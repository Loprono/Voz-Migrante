import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { getHistory, deleteHistoryItem, HistoryItem } from "@/lib/supabase";

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  doctor: "medical-outline",
  banco: "card-outline",
  escuela: "school-outline",
  legal: "document-text-outline",
  otro: "document-outline",
};

const CATEGORY_COLORS: Record<string, string> = {
  doctor: "#EFF6FF",
  banco: "#ECFDF5",
  escuela: "#FFF7ED",
  legal: "#FEF2F2",
  otro: "#F9FAFB",
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  doctor: Colors.primary,
  banco: Colors.accent,
  escuela: "#EA580C",
  legal: Colors.danger,
  otro: Colors.textMuted,
};

const TYPE_LABELS: Record<string, string> = {
  document: "Documento",
  translation: "Traducción",
};

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getHistory();
      setItems(data);
    } catch {
      // No Supabase configured yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = (item: HistoryItem) => {
    Alert.alert(
      "Borrar elemento",
      "¿Quieres eliminar este elemento del historial?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHistoryItem(item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
            } catch {
              Alert.alert("Error", "No se pudo borrar. Intenta de nuevo.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: CATEGORY_COLORS[item.category] ?? Colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={CATEGORY_ICONS[item.category] ?? "document-outline"}
          size={22}
          color={CATEGORY_ICON_COLORS[item.category] ?? Colors.textMuted}
        />
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <View
            style={{
              backgroundColor: item.type === "document" ? Colors.primaryLight : Colors.accentLight,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 100,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: item.type === "document" ? Colors.primary : Colors.accent,
              }}
            >
              {TYPE_LABELS[item.type]}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: Colors.textMuted }}>
            {new Date(item.created_at).toLocaleDateString("es-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const EmptyState = () => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: Colors.primaryLight,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="time-outline" size={36} color={Colors.primary} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary, textAlign: "center" }}>
        Tu historial está vacío
      </Text>
      <Text style={{ fontSize: 15, color: Colors.textMuted, textAlign: "center", lineHeight: 22 }}>
        Los documentos que expliques y tus traducciones aparecerán aquí.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["bottom"]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={loading ? null : EmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          items.length > 0 ? (
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 12 }}>
              {items.length} elemento{items.length !== 1 ? "s" : ""} guardado{items.length !== 1 ? "s" : ""}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
