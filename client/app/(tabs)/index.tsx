import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatCard } from "../../components/StatCard";
import { useApp } from "../../context/AppContext";
import { useColors } from "../../hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { students, attendanceLists, attendanceRecords, isLoading, loadData} = useApp();
  
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = attendanceRecords.filter(r => r.date === today);
  const presentToday = todayRecords.filter(r => r.status === "Present").length;
  const absentToday = todayRecords.filter(r => r.status === "Absent").length;

  const recentLists = useMemo(() =>
    [...attendanceLists].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [attendanceLists]
  );

  const branchStats = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach(s => { map[s.branch] = (map[s.branch] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [students]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const bottomPad = Platform.OS === "web" ? 84 + 16 : insets.bottom + 82;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: bottomPad },
    sectionTitle: {
      fontSize: 13, fontWeight: "600", color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold", marginBottom: 10,
      textTransform: "uppercase", letterSpacing: 0.8,
    },
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
    banner: {
      backgroundColor: colors.primary, borderRadius: colors.radius + 2,
      padding: 18, marginBottom: 20, flexDirection: "row", alignItems: "center",
    },
    bannerText: { flex: 1 },
    bannerTitle: { fontSize: 15, fontWeight: "700", color: "#ffffff", fontFamily: "Inter_700Bold" },
    bannerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginTop: 3 },
    bannerBtn: {
      backgroundColor: "rgba(255,255,255,0.2)", padding: 10, borderRadius: 10,
    },
    listCard: {
      backgroundColor: colors.card, borderRadius: colors.radius + 2,
      borderWidth: 1, borderColor: colors.border, marginBottom: 8,
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 14, paddingVertical: 13,
    },
    listIcon: {
      width: 36, height: 36, borderRadius: 9,
      backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginRight: 12,
    },
    listTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    listSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    branchRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
    branchBadge: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 12,
      paddingVertical: 7, borderWidth: 1, borderColor: colors.border,
    },
    branchName: { fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    branchCount: { fontSize: 12, color: colors.primary, fontFamily: "Inter_700Bold" },
    emptyText: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 16 },
    dateRow: { flexDirection: "row", marginBottom: 16 },
    dateBadge: {
      backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5,
      flexDirection: "row", alignItems: "center", gap: 5,
    },
    dateText: { fontSize: 12, color: colors.primary, fontFamily: "Inter_600SemiBold" },
    sectionGap: { marginBottom: 20 },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loaderText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    shimmerCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius + 2,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      paddingHorizontal: 14,
      paddingVertical: 13,
      flexDirection: "row",
      alignItems: "center",
    },
    shimmerIcon: {
      width: 36,
      height: 36,
      borderRadius: 9,
      backgroundColor: colors.mutedForeground + "30",
      marginRight: 12,
    },
    shimmerContent: {
      flex: 1,
    },
    shimmerTitle: {
      height: 16,
      width: "60%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
      marginBottom: 8,
    },
    shimmerSub: {
      height: 12,
      width: "40%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
    },
    shimmerStatCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius + 2,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 8,
    },
    shimmerStatIcon: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: colors.mutedForeground + "30",
    },
    shimmerStatLabel: {
      height: 12,
      width: "70%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
    },
    shimmerStatValue: {
      height: 20,
      width: "50%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
      marginTop: 4,
    },
  });

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  // Shimmer loader component
  const ShimmerLoader = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.dateRow}>
        <View style={styles.dateBadge}>
          <Feather name="calendar" size={12} color={colors.primary} />
          <Text style={styles.dateText}>Loading...</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsRow}>
        <View style={styles.shimmerStatCard}>
          <View style={styles.shimmerStatIcon} />
          <View style={styles.shimmerStatLabel} />
          <View style={styles.shimmerStatValue} />
        </View>
        <View style={styles.shimmerStatCard}>
          <View style={styles.shimmerStatIcon} />
          <View style={styles.shimmerStatLabel} />
          <View style={styles.shimmerStatValue} />
        </View>
      </View>
      <View style={[styles.statsRow, styles.sectionGap]}>
        <View style={styles.shimmerStatCard}>
          <View style={styles.shimmerStatIcon} />
          <View style={styles.shimmerStatLabel} />
          <View style={styles.shimmerStatValue} />
        </View>
        <View style={styles.shimmerStatCard}>
          <View style={styles.shimmerStatIcon} />
          <View style={styles.shimmerStatLabel} />
          <View style={styles.shimmerStatValue} />
        </View>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Mark Today's Attendance</Text>
          <Text style={styles.bannerSub}>Quickly record attendance for your batch</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Branch Distribution</Text>
      <View style={styles.branchRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.branchBadge}>
            <Text style={styles.branchName}>Loading</Text>
            <Text style={styles.branchCount}>0</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recent Attendance Lists</Text>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.shimmerCard}>
          <View style={styles.shimmerIcon} />
          <View style={styles.shimmerContent}>
            <View style={styles.shimmerTitle} />
            <View style={styles.shimmerSub} />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // Show loader while fetching data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Dashboard" subtitle="Welcome back" />
        <ShimmerLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Dashboard" subtitle="Welcome back" />
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.dateRow}>
          <View style={styles.dateBadge}>
            <Feather name="calendar" size={12} color={colors.primary} />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard label="Total Students" value={students.length} icon="users" color={colors.primary} />
          <StatCard label="Lists Created" value={attendanceLists.length} icon="list" color="#7c3aed" />
        </View>
        <View style={[styles.statsRow, styles.sectionGap]}>
          <StatCard label="Present Today" value={presentToday} icon="check-circle" color="#16a34a" />
          <StatCard label="Absent Today" value={absentToday} icon="x-circle" color="#dc2626" />
        </View>

        <TouchableOpacity style={styles.banner} onPress={() => router.push("/(tabs)/attendance" as any)} activeOpacity={0.85}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Mark Today's Attendance</Text>
            <Text style={styles.bannerSub}>Quickly record attendance for your batch</Text>
          </View>
          <View style={styles.bannerBtn}>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {branchStats.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Branch Distribution</Text>
            <View style={styles.branchRow}>
              {branchStats.map(([branch, count]) => (
                <View key={branch} style={styles.branchBadge}>
                  <Text style={styles.branchName}>{branch}</Text>
                  <Text style={styles.branchCount}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Recent Attendance Lists</Text>
        {recentLists.length === 0 ? (
          <Text style={styles.emptyText}>No attendance lists created yet</Text>
        ) : (
          recentLists.map(list => (
            <TouchableOpacity
              key={list.id}
              style={styles.listCard}
              onPress={() => router.push("/(tabs)/attendance" as any)}
              activeOpacity={0.7}
            >
              <View style={styles.listIcon}>
                <Feather name="check-square" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{list.branch} · {list.batch}</Text>
                <Text style={styles.listSub}>{list.month}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}