import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CommunityReportCard } from "@/components/CommunityReportCard";
import { useApp } from "@/context/AppContext";
import { BUS_ROUTES } from "@/data/busRoutes";
import type { ReportType } from "@/data/types";
import { useColors } from "@/hooks/useColors";

const FILTERS: { key: ReportType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "crowd", label: "Crowd" },
  { key: "delay", label: "Delay" },
  { key: "tip", label: "Tips" },
  { key: "alert", label: "Alerts" },
];

const REPORT_TYPES: { key: ReportType; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "crowd", label: "Crowd", icon: "users" },
  { key: "delay", label: "Delay", icon: "clock" },
  { key: "tip", label: "Tip", icon: "info" },
  { key: "alert", label: "Alert", icon: "alert-triangle" },
];

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, addReport, upvoteReport } = useApp();
  const [filter, setFilter] = useState<ReportType | "all">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [newType, setNewType] = useState<ReportType>("tip");
  const [newMessage, setNewMessage] = useState("");
  const [newStop, setNewStop] = useState("");

  const filtered = useMemo(() => {
    const list =
      filter === "all" ? reports : reports.filter((r) => r.type === filter);
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [reports, filter]);

  function submitReport() {
    if (!newMessage.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    addReport({
      type: newType,
      message: newMessage.trim(),
      stopName: newStop.trim() || undefined,
      routeId: BUS_ROUTES[0]?.id,
      author: "you",
    });
    setNewMessage("");
    setNewStop("");
    setModalVisible(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Community Pulse
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Live crowd, delays, tips & alerts
        </Text>
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === f.key ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={{
                  color:
                    filter === f.key
                      ? colors.primaryForeground
                      : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 100,
        }}
        renderItem={({ item }) => (
          <CommunityReportCard
            report={item}
            onUpvote={() => upvoteReport(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No reports yet. Be the first to share!
          </Text>
        }
      />

      <Pressable
        style={[
          styles.fab,
          { backgroundColor: colors.primary, bottom: insets.bottom + 90 },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              New report
            </Text>
            <View style={styles.typeRow}>
              {REPORT_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor:
                        newType === t.key ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setNewType(t.key)}
                >
                  <Feather
                    name={t.icon}
                    size={14}
                    color={
                      newType === t.key
                        ? colors.primaryForeground
                        : colors.mutedForeground
                    }
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="What's happening?"
              placeholderTextColor={colors.mutedForeground}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TextInput
              style={[
                styles.modalInputSmall,
                {
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Stop name (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={newStop}
              onChangeText={setNewStop}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={submitReport}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Post</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 12 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  empty: { textAlign: "center", marginTop: 40, fontSize: 14 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  typeChip: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  modalInputSmall: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submitBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
});
