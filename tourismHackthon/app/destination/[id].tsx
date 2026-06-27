import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BUS_ROUTES } from "@/data/busRoutes";
import { DESTINATIONS } from "@/data/destinations";
import { useColors } from "@/hooks/useColors";

export default function DestinationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const destination = DESTINATIONS.find((d) => d.id === id);

  if (!destination) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Destination not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary, marginTop: 12 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const routes = BUS_ROUTES.filter((r) =>
    destination.busRoutes.includes(r.number),
  );
  const [c1, c2] = destination.gradientColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[c1, c2]}
        style={[styles.hero, { paddingTop: insets.top + 8 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.category}>{destination.category}</Text>
        <Text style={styles.name}>{destination.name}</Text>
        <Text style={styles.nepali}>{destination.nepaliName}</Text>
        <View style={styles.heroMeta}>
          <Feather name="star" size={14} color="#FFD700" />
          <Text style={styles.heroMetaText}>{destination.rating}</Text>
          <Text style={styles.heroMetaText}>
            · NPR {destination.entranceFee} entry
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        <Text style={[styles.desc, { color: colors.foreground }]}>
          {destination.description}
        </Text>

        <View style={styles.infoGrid}>
          {[
            { icon: "clock" as const, label: "Duration", value: `${destination.visitDuration} min` },
            { icon: "sun" as const, label: "Best time", value: destination.bestTime },
            { icon: "map-pin" as const, label: "Address", value: destination.address },
            { icon: "navigation" as const, label: "Distance", value: `${destination.distanceFromCenter} km` },
          ].map((item) => (
            <View
              key={item.label}
              style={[
                styles.infoCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name={item.icon} size={16} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                {item.label}
              </Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Bus routes
        </Text>
        {routes.map((r) => (
          <View
            key={r.id}
            style={[
              styles.routeRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.routeBadge, { backgroundColor: r.color }]}>
              <Text style={styles.routeBadgeText}>{r.number}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeName, { color: colors.foreground }]}>
                {r.name}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                Get off at {destination.nearestBusStop} · NPR {r.fare}
              </Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Cultural tips
        </Text>
        {destination.culturalTips.map((tip, i) => (
          <Pressable
            key={i}
            style={[
              styles.tipRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setExpandedTip(expandedTip === i ? null : i)}
          >
            <Feather name="book" size={14} color={colors.accent} />
            <Text style={[styles.tipText, { color: colors.foreground }]}>
              {tip}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={[styles.planBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: "/plan",
              params: { q: `Visit ${destination.name}, half day` },
            })
          }
        >
          <Feather name="cpu" size={18} color="#fff" />
          <Text style={styles.planBtnText}>Plan a trip here</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  backBtn: { marginBottom: 16, alignSelf: "flex-start" },
  category: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  name: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  nepali: { color: "rgba(255,255,255,0.85)", fontSize: 16, marginTop: 2 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 },
  heroMetaText: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  scroll: { padding: 20 },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  infoCard: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  infoLabel: { fontSize: 11, fontWeight: "600" },
  infoValue: { fontSize: 13, fontWeight: "500" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  routeBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  routeBadgeText: { color: "#fff", fontWeight: "800" },
  routeName: { fontSize: 14, fontWeight: "600" },
  tipRow: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  planBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  planBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
