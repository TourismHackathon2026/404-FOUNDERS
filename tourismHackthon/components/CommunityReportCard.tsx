import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CommunityReport } from "@/data/types";
import { useColors } from "@/hooks/useColors";

const TYPE_CONFIG: Record<
  CommunityReport["type"],
  { icon: keyof typeof Feather.glyphMap; color: string; label: string }
> = {
  crowd: { icon: "users", color: "#F5A623", label: "Crowd" },
  delay: { icon: "clock", color: "#EF4444", label: "Delay" },
  tip: { icon: "info", color: "#457B9D", label: "Tip" },
  alert: { icon: "alert-triangle", color: "#C4122F", label: "Alert" },
};

interface Props {
  report: CommunityReport;
  onUpvote?: () => void;
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function CommunityReportCard({ report, onUpvote }: Props) {
  const colors = useColors();
  const config = TYPE_CONFIG[report.type];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: config.color + "22" }]}>
          <Feather name={config.icon} size={14} color={config.color} />
          <Text style={[styles.badgeText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {timeAgo(report.timestamp)}
        </Text>
      </View>
      <Text style={[styles.message, { color: colors.foreground }]}>
        {report.message}
      </Text>
      {(report.stopName || report.routeId) && (
        <Text style={[styles.location, { color: colors.mutedForeground }]}>
          {[report.stopName, report.routeId?.replace("route-", "Route ")]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      )}
      <View style={styles.footer}>
        <Text style={[styles.author, { color: colors.mutedForeground }]}>
          @{report.author}
        </Text>
        <Pressable onPress={onUpvote} style={styles.upvote}>
          <Feather
            name="arrow-up"
            size={14}
            color={report.userUpvoted ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.upvoteCount,
              {
                color: report.userUpvoted
                  ? colors.primary
                  : colors.mutedForeground,
              },
            ]}
          >
            {report.upvotes}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  time: { fontSize: 11 },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  location: { fontSize: 12, marginBottom: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  author: { fontSize: 11 },
  upvote: { flexDirection: "row", alignItems: "center", gap: 4 },
  upvoteCount: { fontSize: 12, fontWeight: "600" },
});
