import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

export function useColors() {
  const scheme = useColorScheme();
  const mode = scheme === "dark" ? "dark" : "light";
  return { ...colors[mode], radius: colors.radius };
}

export type ThemeColors = ReturnType<typeof useColors>;
