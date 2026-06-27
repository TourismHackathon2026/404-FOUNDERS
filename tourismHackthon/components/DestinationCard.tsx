import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { Destination } from "@/data/types";
import { useColors } from "@/hooks/useColors";

interface Props {
  destination: Destination;
}

export function DestinationCard({ destination }: Props) {
  const colors = useColors();
  const router = useRouter();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const [c1, c2] = destination.gradientColors;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 20 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20 });
        }}
        onPress={() => router.push(`/destination/${destination.id}`)}
      >
        <LinearGradient
          colors={[c1, c2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.topRow}>
            <Text style={styles.category}>{destination.category}</Text>
            <View style={styles.ratingRow}>
              <Feather name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{destination.rating}</Text>
            </View>
          </View>
          <Text style={styles.name}>{destination.name}</Text>
          <Text style={styles.nepali}>{destination.nepaliName}</Text>
          <View style={styles.metaRow}>
            <Feather name="clock" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.meta}>{destination.visitDuration} min</Text>
            <Feather
              name="navigation"
              size={12}
              color="rgba(255,255,255,0.8)"
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.meta}>{destination.distanceFromCenter} km</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  category: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { color: "#fff", fontSize: 12, fontWeight: "600" },
  name: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  nepali: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
});
