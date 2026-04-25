import { Feather } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter, useSegments } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useColors } from "../hooks/useColors";

interface NavItem {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  segment: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: "grid", route: "/(drawer)/dashboard", segment: "dashboard" },
  { label: "Students", icon: "users", route: "/(drawer)/students", segment: "students" },
  { label: "Attendance", icon: "check-square", route: "/(drawer)/attendance", segment: "attendance" },
  { label: "View History", icon: "clock", route: "/(drawer)/history", segment: "history" },
];

export function DrawerContent(props: any) {
  const colors = useColors();
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { students, attendanceLists, attendanceRecords } = useApp();

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);
  const presentToday = todayRecords.filter(r => r.status === "Present").length;
  const absentToday = todayRecords.filter(r => r.status === "Absent").length;

  const currentSegment = segments[segments.length - 1] || "dashboard";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.sidebar,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "web" ? insets.top + 16 : 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.08)",
    },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    logoCircle: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    appTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.sidebarForeground,
      fontFamily: "Inter_700Bold",
    },
    appSubtitle: {
      fontSize: 12,
      color: colors.sidebarMuted,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    statsRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 16,
    },
    statBox: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.07)",
      borderRadius: 8,
      padding: 10,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: "700",
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
    },
    statLabel: {
      fontSize: 10,
      color: colors.sidebarMuted,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    nav: {
      paddingHorizontal: 12,
      paddingTop: 16,
      flex: 1,
    },
    sectionLabel: {
      fontSize: 10,
      letterSpacing: 1.2,
      color: colors.sidebarMuted,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 6,
      marginLeft: 8,
      textTransform: "uppercase",
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 2,
    },
    navItemActive: {
      backgroundColor: colors.sidebarActive,
    },
    navLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.sidebarMuted,
    },
    navLabelActive: {
      color: colors.sidebarActiveForeground,
      fontFamily: "Inter_600SemiBold",
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 16,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.08)",
      paddingTop: 16,
    },
    footerText: {
      fontSize: 11,
      color: colors.sidebarMuted,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} scrollEnabled={false} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Feather name="check-square" size={20} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.appTitle}>AttendPro</Text>
              <Text style={styles.appSubtitle}>Attendance Manager</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{students.length}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: "#4ade80" }]}>{presentToday}</Text>
              <Text style={styles.statLabel}>Present Today</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: "#f87171" }]}>{absentToday}</Text>
              <Text style={styles.statLabel}>Absent Today</Text>
            </View>
          </View>
        </View>

        <View style={styles.nav}>
          <Text style={styles.sectionLabel}>Navigation</Text>
          {NAV_ITEMS.map((item) => {
            const isActive = currentSegment === item.segment;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <Feather
                  name={item.icon}
                  size={18}
                  color={isActive ? "#ffffff" : "#94a3b8"}
                />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
                {isActive && (
                  <View style={{ marginLeft: "auto" }}>
                    <Feather name="chevron-right" size={14} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AttendPro v1.0 · Institute Edition</Text>
      </View>
    </View>
  );
}
