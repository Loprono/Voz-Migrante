import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type HistoryItem = {
  id: string;
  type: "document" | "translation";
  title: string;
  category: "doctor" | "banco" | "escuela" | "legal" | "otro";
  content: string;
  created_at: string;
};

export async function saveToHistory(item: Omit<HistoryItem, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("history")
    .insert([item])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function deleteHistoryItem(id: string) {
  const { error } = await supabase.from("history").delete().eq("id", id);
  if (error) throw error;
}
