import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useColors } from "../hooks/useColors";

export function ReportGridView({ group, onBack }: { group: any; onBack: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, attendanceRecords } = useApp();

  const batchStudents = useMemo(() => {
    return students
      .filter((s) => s.branch === group.branch && s.batch === group.batch)
      .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
  }, [students, group]);

  const listRecords = useMemo(() => {
    return attendanceRecords.filter((r) => group.listIds.includes(r.attendanceListId));
  }, [attendanceRecords, group]);

  const dates = useMemo(() => {
    const uniqueDates = Array.from(new Set(listRecords.map((r) => r.date)));
    return uniqueDates.sort();
  }, [listRecords]);

  const recordMap = useMemo(() => {
    const map: Record<string, Record<string, "Present" | "Absent">> = {};
    listRecords.forEach((r) => {
      if (!map[r.studentId]) map[r.studentId] = {};
      map[r.studentId][r.date] = r.status;
    });
    return map;
  }, [listRecords]);

  const studentPercentages = useMemo(() => {
    const percentages: Record<string, number> = {};
    batchStudents.forEach((student) => {
      const studentRecords = recordMap[student.id] || {};
      let totalMarkedDays = 0;
      let presentDays = 0;
      dates.forEach((date) => {
        const status = studentRecords[date];
        if (status === "Present") {
          presentDays++;
          totalMarkedDays++;
        } else if (status === "Absent") {
          totalMarkedDays++;
        }
      });
      const percentage = totalMarkedDays > 0 ? (presentDays / totalMarkedDays) * 100 : 0;
      percentages[student.id] = Math.round(percentage);
    });
    return percentages;
  }, [batchStudents, recordMap, dates]);

  const formatDateShort = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const bottomPad = Platform.OS === "web" ? 84 + 16 : insets.bottom + 82;
  const ROW_HEIGHT = 44;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 100 },
    topBar: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "web" ? Math.max(insets.top, 67) + 12 : insets.top + 12,
      paddingBottom: 14,
    },
    backRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    backBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    },
    backText: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    listTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    listSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    gridContainer: { flex: 1, backgroundColor: colors.background },
    headerRow: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: colors.border, backgroundColor: colors.card, height: ROW_HEIGHT },
    row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: ROW_HEIGHT },
    fixedWrap: { borderRightWidth: 2, borderRightColor: colors.border, backgroundColor: colors.card, zIndex: 1 },
    fixedCell: { height: ROW_HEIGHT, justifyContent: "center", paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: colors.border },
    fixedHeaderCell: { fontSize: 12, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    cellName: { fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    cellReg: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    percentageCell: { fontSize: 13, fontWeight: "700", color: "#16a34a", fontFamily: "Inter_700Bold" },
    percentageHeaderCell: { fontSize: 11, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    headerDateCell: { width: 70, height: ROW_HEIGHT, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.card },
    headerDateText: { fontSize: 11, fontWeight: "600", color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" },
    dataCell: { width: 70, minHeight: ROW_HEIGHT, justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderRightColor: colors.border },
    statusText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
    emptyText: { padding: 32, textAlign: "center", color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 },
    scrollViewContent: { flexDirection: "row" },
    scrollViewHorizontal: { flex: 1 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.backRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={14} color={colors.foreground} />
            <Text style={styles.backText}>Back to Reports</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.listTitle}>{group.branch} — {group.batch}</Text>
        <Text style={styles.listSub}>{group.subject} · {group.semester}</Text>
      </View>

      <View style={styles.gridContainer}>
        {batchStudents.length === 0 ? (
          <Text style={styles.emptyText}>No students found.</Text>
        ) : dates.length === 0 ? (
          <Text style={styles.emptyText}>No attendance records marked yet.</Text>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad }}>
            <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={true} style={styles.scrollViewHorizontal}>
              <View style={styles.scrollViewContent}>
                {/* Left Fixed Columns */}
                <View style={styles.fixedWrap}>
                  <View style={[styles.row, { borderBottomWidth: 2, borderBottomColor: colors.border }]}>
                    <View style={[styles.fixedCell, { width: 50 }]}><Text style={styles.fixedHeaderCell}>S.No</Text></View>
                    <View style={[styles.fixedCell, { width: 110 }]}><Text style={styles.fixedHeaderCell}>Reg No</Text></View>
                    <View style={[styles.fixedCell, { width: 140 }]}><Text style={styles.fixedHeaderCell}>Name</Text></View>
                    <View style={[styles.fixedCell, { width: 70 }]}><Text style={styles.fixedHeaderCell}>Present</Text></View>
                    <View style={[styles.fixedCell, { width: 60 }]}><Text style={styles.fixedHeaderCell}>Total</Text></View>
                    <View style={[styles.fixedCell, { width: 90, backgroundColor: colors.accent }]}><Text style={styles.percentageHeaderCell}>Percentage</Text></View>
                  </View>

                  {batchStudents.map((s, idx) => {
                    const studentRecords = recordMap[s.id] || {};
                    let presentDays = 0;
                    dates.forEach((d) => {
                      if (studentRecords[d] === "Present") presentDays++;
                    });

                    return (
                      <View key={s.id} style={styles.row}>
                        <View style={[styles.fixedCell, { width: 50 }]}><Text style={styles.cellReg}>{idx + 1}</Text></View>
                        <View style={[styles.fixedCell, { width: 110 }]}><Text style={styles.cellReg} numberOfLines={1}>{s.registrationNumber}</Text></View>
                        <View style={[styles.fixedCell, { width: 140 }]}><Text style={styles.cellName} numberOfLines={1}>{s.name}</Text></View>
                        <View style={[styles.fixedCell, { width: 70 }]}><Text style={styles.cellReg}>{presentDays}</Text></View>
                        <View style={[styles.fixedCell, { width: 60 }]}><Text style={styles.cellReg}>{dates.length}</Text></View>
                        <View style={[styles.fixedCell, { width: 90, backgroundColor: colors.accent }]}><Text style={styles.percentageCell}>{studentPercentages[s.id]}%</Text></View>
                      </View>
                    );
                  })}
                </View>

                {/* Right Scrollable Columns */}
                <View>
                  <View style={styles.headerRow}>
                    {dates.map((d) => (
                      <View key={d} style={styles.headerDateCell}>
                        <Text style={styles.headerDateText}>{formatDateShort(d)}</Text>
                      </View>
                    ))}
                  </View>
                  {batchStudents.map((s) => (
                    <View key={s.id} style={styles.row}>
                      {dates.map((d) => {
                        const status = recordMap[s.id]?.[d];
                        const isPresent = status === "Present";
                        const text = isPresent ? "P" : status === "Absent" ? "A" : "-";
                        const color = isPresent ? "#16a34a" : status === "Absent" ? "#dc2626" : colors.mutedForeground;

                        return (
                          <View key={d} style={styles.dataCell}>
                            <Text style={[styles.statusText, { color }]}>{text}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
