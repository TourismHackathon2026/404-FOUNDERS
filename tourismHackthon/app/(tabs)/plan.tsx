import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JourneyStepCard } from "@/components/JourneyStepCard";
import { useApp } from "@/context/AppContext";
import { BUS_ROUTES } from "@/data/busRoutes";
import { DESTINATIONS } from "@/data/destinations";
import type { Itinerary, JourneyStepData } from "@/data/types";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  itinerary?: Itinerary;
}

function generateItinerary(query: string): Itinerary {
  const q = query.toLowerCase();
  const budgetMatch = q.match(/(\d+)\s*npr/);
  const hoursMatch = q.match(/(\d+)\s*hour/);
  const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : 800;
  const maxHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 6;

  const wantsBuddhist = /buddhist|stupa|boudha|swayambhu|monk/.test(q);
  const wantsTemple = /temple|hindu|mandir|spiritual|shiva|pashupatinath/.test(q);
  const wantsFood = /momo|food|eat|thamel|restaurant/.test(q);
  const wantsHeritage = /heritage|durbar|bhaktapur|patan/.test(q);
  const wantsViews = /view|sunrise|nagarkot|himalaya/.test(q);

  const priorityIds: string[] = [];
  if (wantsBuddhist) priorityIds.push("boudhanath", "swayambhunath");
  if (wantsTemple) priorityIds.push("pashupatinath");
  if (wantsFood) priorityIds.push("thamel");
  if (wantsHeritage) priorityIds.push("bhaktapur", "patan");
  if (wantsViews) priorityIds.push("nagarkot", "swayambhunath");

  const selectedIds = [
    ...new Set(
      priorityIds.length > 0
        ? priorityIds
        : ["boudhanath", "pashupatinath", "thamel"],
    ),
  ].slice(0, 3);

  const selected = selectedIds
    .map((id) => DESTINATIONS.find((d) => d.id === id))
    .filter(Boolean) as typeof DESTINATIONS;

  const steps: JourneyStepData[] = [];
  let totalTime = 0;
  let totalCost = 0;

  steps.push({
    type: "walk",
    title: "Start at Ratnapark",
    description: "Central bus hub — grab breakfast momo nearby if hungry",
    duration: 10,
    cost: 0,
  });
  totalTime += 10;

  selected.forEach((dest, i) => {
    const route =
      BUS_ROUTES.find((r) => dest.busRoutes.includes(r.number)) ?? BUS_ROUTES[0];
    steps.push({
      type: "bus",
      title: `Bus ${route.number} to ${dest.nearestBusStop}`,
      description: `${route.from} → ${dest.nearestBusStop}. Fare NPR ${route.fare}`,
      duration: route.duration,
      cost: route.fare,
    });
    totalTime += route.duration;
    totalCost += route.fare;

    steps.push({
      type: "visit",
      title: dest.name,
      description: dest.description.slice(0, 120) + "...",
      duration: dest.visitDuration,
      cost: dest.entranceFee,
    });
    totalTime += dest.visitDuration;
    totalCost += dest.entranceFee;

    if (wantsFood && dest.id === "thamel" && i === selected.length - 1) {
      steps.push({
        type: "eat",
        title: "Buff momo lunch in Thamel",
        description: "Try jhol momo at a local eatery — budget NPR 200–300",
        duration: 45,
        cost: 250,
      });
      totalTime += 45;
      totalCost += 250;
    }
  });

  if (totalCost > budget) {
    totalCost = budget;
  }

  const title =
    wantsBuddhist
      ? "Buddhist Heritage Day"
      : wantsTemple
        ? "Sacred Temple Circuit"
        : wantsFood
          ? "Culture & Momo Trail"
          : wantsViews
            ? "Valley Views Tour"
            : "Kathmandu Highlights";

  return {
    id: `it-${Date.now()}`,
    title,
    totalTime: Math.min(totalTime, maxHours * 60),
    totalCost,
    destinationCount: selected.length,
    steps,
    savedAt: Date.now(),
    query,
  };
}

export default function PlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { saveItinerary, itineraries, deleteItinerary } = useApp();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! Tell me what you'd like to explore — temples, momos, budget, time. I'll build a step-by-step itinerary with real bus routes.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", text: trimmed },
      ]);
      setLoading(true);

      await new Promise((r) => setTimeout(r, 800));

      const itinerary = generateItinerary(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `Here's your ${itinerary.title}! ${itinerary.destinationCount} stops, ~${Math.round(itinerary.totalTime / 60)} hours, NPR ${itinerary.totalCost} estimated.`,
          itinerary,
        },
      ]);
      setLoading(false);
    },
    [loading],
  );

  useEffect(() => {
    if (q && typeof q === "string") {
      handleSend(q);
    }
  }, [q]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          AI Journey Planner
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Rule-based · no API key needed
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.userBubble : styles.aiBubble,
              {
                backgroundColor:
                  item.role === "user" ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={{
                color:
                  item.role === "user"
                    ? colors.primaryForeground
                    : colors.foreground,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {item.text}
            </Text>
            {item.itinerary && (
              <View style={styles.itineraryBlock}>
                {item.itinerary.steps.map((step: JourneyStepData, i: number) => (
                  <JourneyStepCard
                    key={i}
                    step={step}
                    index={i}
                    isLast={i === item.itinerary!.steps.length - 1}
                  />
                ))}
                <Pressable
                  style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                  onPress={() => saveItinerary(item.itinerary!)}
                >
                  <Feather name="bookmark" size={16} color="#fff" />
                  <Text style={styles.saveBtnText}>Save itinerary</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />

      {loading && (
        <Text style={[styles.thinking, { color: colors.mutedForeground }]}>
          Planning your yatra...
        </Text>
      )}

      {itineraries.length > 0 && (
        <ScrollView
          horizontal
          style={styles.savedRow}
          showsHorizontalScrollIndicator={false}
        >
          {itineraries.map((it) => (
            <Pressable
              key={it.id}
              style={[
                styles.savedChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onLongPress={() => deleteItinerary(it.id)}
            >
              <Text style={[styles.savedTitle, { color: colors.foreground }]}>
                {it.title}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                NPR {it.totalCost}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View
        style={[
          styles.inputRow,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 80,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.foreground,
              borderColor: colors.border,
            },
          ]}
          placeholder="temples + momos, 500 NPR, 5 hours"
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend(input)}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleSend(input)}
        >
          <Feather name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  bubble: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    maxWidth: "95%",
    borderWidth: 1,
  },
  userBubble: { alignSelf: "flex-end", borderWidth: 0 },
  aiBubble: { alignSelf: "flex-start" },
  itineraryBlock: { marginTop: 12 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  thinking: { textAlign: "center", fontSize: 13, marginBottom: 8 },
  savedRow: { maxHeight: 60, paddingHorizontal: 16, marginBottom: 8 },
  savedChip: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginRight: 8,
    minWidth: 120,
  },
  savedTitle: { fontSize: 13, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
