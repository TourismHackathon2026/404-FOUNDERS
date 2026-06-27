import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { JourneyStepData } from "@/data/types";
import { useColors } from "@/hooks/useColors";

const ICONS: Record<JourneyStepData["type"], keyof typeof Feather.glyphMap> = {
  walk: "navigation",
  bus: "truck",
  visit: "map-pin",
  eat: "coffee",
};

interface Props {
  step: JourneyStepData;
  index: number;
  isLast?: boolean;
}

export function JourneyStepCard({ step, index, isLast }: Props) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Feather name={ICONS[step.type]} size={14} color="#fff" />
        </View>
        {!isLast && (
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        )}
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.topRow}>
          <Text style={[styles.stepNum, { color: colors.mutedForeground }]}>
            Step {index + 1}
          </Text>
          <Text style={[styles.duration, { color: colors.accent }]}>
            {step.duration} min · NPR {step.cost}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {step.title}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          {step.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: 4 },
  timeline: { alignItems: "center", width: 36 },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  line: { width: 2, flex: 1, marginVertical: 4 },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  stepNum: { fontSize: 11, fontWeight: "600" },
  duration: { fontSize: 11, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  desc: { fontSize: 13, lineHeight: 18 },
});
