import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSidebar } from "../context/SidebarContext";
import { useColors } from "../hooks/useColors";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: { icon: keyof typeof Feather.glyphMap; onPress: () => void };
}

export function ScreenHeader({ title, subtitle, rightAction }: ScreenHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { toggle } = useSidebar();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const styles = StyleSheet.create({
    header: {
      backgroundColor: colors.card,
      paddingTop: topPad + 12,
      paddingBottom: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    menuBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: "center", justifyContent: "center",
    },
    titleBlock: { flex: 1 },
    title: {
      fontSize: 17, fontWeight: "700", color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    subtitle: {
      fontSize: 12, color: colors.mutedForeground,
      fontFamily: "Inter_400Regular", marginTop: 1,
    },
    rightBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center",
    },
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuBtn} onPress={toggle} activeOpacity={0.7}>
        <Feather name="menu" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightAction ? (
        <TouchableOpacity style={styles.rightBtn} onPress={rightAction.onPress} activeOpacity={0.7}>
          <Feather name={rightAction.icon} size={17} color="#ffffff" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
