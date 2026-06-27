import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RouteCard } from "@/components/RouteCard";
import { BUS_ROUTES, FARE_GUIDE } from "@/data/busRoutes";
import { DESTINATIONS } from "@/data/destinations";
import { useColors } from "@/hooks/useColors";

export default function NavigateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const filteredRoutes = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return BUS_ROUTES;
    return BUS_ROUTES.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.number.includes(q) ||
        r.stops.some((s) => s.toLowerCase().includes(q)),
    );
  }, [search]);

  const destinationMatch = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return null;
    return DESTINATIONS.find(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.id.includes(q) ||
        d.nearestBusStop.toLowerCase().includes(q),
    );
  }, [search]);

  const recommendedRoutes = useMemo(() => {
    if (!destinationMatch) return [];
    return BUS_ROUTES.filter((r) =>
      destinationMatch.busRoutes.includes(r.number),
    );
  }, [destinationMatch]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Bus Navigator
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          5 Kathmandu Valley routes
        </Text>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search route, stop, or destination..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {destinationMatch && recommendedRoutes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Routes to {destinationMatch.name}
            </Text>
            {recommendedRoutes.map((r) => (
              <RouteCard key={r.id} route={r} highlighted />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            All routes
          </Text>
          {filteredRoutes.map((r) => (
            <RouteCard key={r.id} route={r} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Fare guide
          </Text>
          <View
            style={[
              styles.fareCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {[FARE_GUIDE.shortTrip, FARE_GUIDE.mediumTrip, FARE_GUIDE.longTrip].map(
              (tier) => (
                <View key={tier.label} style={styles.fareRow}>
                  <Text style={[styles.fareLabel, { color: colors.foreground }]}>
                    {tier.label}
                  </Text>
                  <Text style={[styles.fareAmount, { color: colors.primary }]}>
                    NPR {tier.fare}
                  </Text>
                </View>
              ),
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            {FARE_GUIDE.tips.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Feather name="info" size={12} color={colors.accent} />
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  scroll: { paddingHorizontal: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  fareCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fareLabel: { fontSize: 14 },
  fareAmount: { fontSize: 14, fontWeight: "700" },
  divider: { height: 1, marginVertical: 12 },
  tipRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
