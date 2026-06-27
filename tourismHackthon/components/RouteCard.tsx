import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { BusRoute } from "@/data/types";
import { useColors } from "@/hooks/useColors";

interface Props {
  route: BusRoute;
  highlighted?: boolean;
}

export function RouteCard({ route, highlighted }: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: highlighted ? route.color : colors.border,
          borderWidth: highlighted ? 2 : 1,
        },
      ]}
    >
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.header}>
        <View style={[styles.badge, { backgroundColor: route.color }]}>
          <Text style={styles.badgeText}>{route.number}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {route.name}
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {route.from} → {route.to} · NPR {route.fare} · ~{route.duration} min
          </Text>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.mutedForeground}
        />
      </Pressable>
      {expanded && (
        <View style={styles.stops}>
          {route.stops.map((stop, i) => (
            <View key={stop} style={styles.stopRow}>
              <View style={[styles.dot, { backgroundColor: route.color }]}>
                <Text style={styles.dotText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stopName, { color: colors.foreground }]}>
                {stop}
              </Text>
            </View>
          ))}
          <Text style={[styles.hours, { color: colors.mutedForeground }]}>
            {route.operatingHours} · every ~{route.frequency} min
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, marginBottom: 10, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  sub: { fontSize: 12 },
  stops: { paddingHorizontal: 14, paddingBottom: 14 },
  stopRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  stopName: { fontSize: 13 },
  hours: { fontSize: 11, marginTop: 4, marginLeft: 32 },
});
