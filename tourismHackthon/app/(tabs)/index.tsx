import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CommunityReportCard } from "@/components/CommunityReportCard";
import { DestinationCard } from "@/components/DestinationCard";
import { useApp } from "@/context/AppContext";
import { CULTURAL_TIPS } from "@/data/culturalTips";
import { DESTINATIONS } from "@/data/destinations";
import { useColors } from "@/hooks/useColors";

const QUICK_PROMPTS = [
  "Buddhist sites today",
  "Budget 500 NPR, 4 hours",
  "Morning temple tour",
  "Best views in Kathmandu",
  "Momo hunt in Thamel",
];

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports, upvoteReport } = useApp();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Subha Prabhat" : hour < 17 ? "Namaste" : "Subha Sanjha";

  const dailyTip = useMemo(() => {
    const dayIndex = new Date().getDate() % CULTURAL_TIPS.length;
    return CULTURAL_TIPS[dayIndex];
  }, []);

  const recentAlerts = reports
    .filter((r) => r.type === "alert" || r.type === "crowd")
    .slice(0, 2);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#C4122F", "#8B1A1A"]}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.heroTitle}>YatrAI</Text>
        <Text style={styles.heroSub}>Your Kathmandu Valley guide</Text>
        <Pressable
          style={styles.heroCta}
          onPress={() => router.push("/destination/pashupatinath")}
        >
          <Feather name="star" size={14} color="#C4122F" />
          <Text style={styles.heroCtaText}>Featured: Pashupatinath</Text>
          <Feather name="chevron-right" size={14} color="#C4122F" />
        </Pressable>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Quick plan
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                style={[styles.promptChip, { borderColor: colors.border }]}
                onPress={() =>
                  router.push({ pathname: "/plan", params: { q: prompt } })
                }
              >
                <Feather name="zap" size={12} color={colors.primary} />
                <Text style={[styles.promptText, { color: colors.foreground }]}>
                  {prompt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Daily insight
          </Text>
          <View
            style={[
              styles.tipCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.tipHeader}>
              <Feather name="book-open" size={16} color={colors.accent} />
              <Text style={[styles.tipCategory, { color: colors.accent }]}>
                {dailyTip.category}
              </Text>
            </View>
            <Text style={[styles.tipTitle, { color: colors.foreground }]}>
              {dailyTip.title}
            </Text>
            <Text style={[styles.tipBody, { color: colors.mutedForeground }]}>
              {dailyTip.body}
            </Text>
          </View>
        </View>

        {recentAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Community alerts
            </Text>
            {recentAlerts.map((r) => (
              <CommunityReportCard
                key={r.id}
                report={r}
                onUpvote={() => upvoteReport(r.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Destinations
          </Text>
          {DESTINATIONS.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  greeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  heroTitle: { color: "#fff", fontSize: 32, fontWeight: "800" },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 4 },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 16,
  },
  heroCtaText: { color: "#C4122F", fontWeight: "600", fontSize: 13 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  promptChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  promptText: { fontSize: 13 },
  tipCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  tipCategory: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  tipTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  tipBody: { fontSize: 14, lineHeight: 20 },
});
