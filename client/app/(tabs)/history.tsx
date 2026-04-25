import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarPicker } from "../../components/CalendarPicker";
import { EmptyState } from "../../components/EmptyState";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useApp } from "../../context/AppContext";
import { useColors } from "../../hooks/useColors";
import { BATCHES, BRANCHES, SEMESTERS } from "../../types";
import { ReportGridView } from "../../components/ReportGridView";

function DateRangeModal({
  visible,
  onClose,
  onDownload,
}: {
  visible: boolean;
  onClose: () => void;
  onDownload: (from: string, to: string) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().split("T")[0];
  const [pickingFrom, setPickingFrom] = useState(true);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(today);

  const formatD = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20, padding: 16,
    },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 },
    title: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 },
    tabs: { flexDirection: "row", gap: 8, marginBottom: 14 },
    tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center", borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
    tabActive: { borderColor: colors.primary, backgroundColor: colors.accent },
    tabText: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    tabTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    downloadBtn: { backgroundColor: colors.primary, borderRadius: colors.radius, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
    downloadBtnText: { fontSize: 15, fontWeight: "700", color: "#ffffff", fontFamily: "Inter_700Bold" },
    rangeDisplay: {
      flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14,
      backgroundColor: colors.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border,
    },
    rangeText: { flex: 1, fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium" },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Download Attendance</Text>
            <View style={styles.rangeDisplay}>
              <Feather name="calendar" size={14} color={colors.primary} />
              <Text style={styles.rangeText}>{formatD(fromDate)} — {formatD(toDate)}</Text>
            </View>
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, pickingFrom && styles.tabActive]} onPress={() => setPickingFrom(true)}>
                <Text style={[styles.tabText, pickingFrom && styles.tabTextActive]}>From Date</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, !pickingFrom && styles.tabActive]} onPress={() => setPickingFrom(false)}>
                <Text style={[styles.tabText, !pickingFrom && styles.tabTextActive]}>To Date</Text>
              </TouchableOpacity>
            </View>
            {pickingFrom ? (
              <CalendarPicker selectedDate={fromDate} onSelectDate={setFromDate} />
            ) : (
              <CalendarPicker selectedDate={toDate} onSelectDate={setToDate} />
            )}
            
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={[styles.downloadBtn, { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={onClose}>
                <Text style={[styles.downloadBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.downloadBtn, { flex: 1 }]} onPress={() => onDownload(fromDate, toDate)}>
                <Feather name="download" size={16} color="#ffffff" />
                <Text style={styles.downloadBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function AllReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { attendanceLists, attendanceRecords, students } = useApp();

  const [filterBranch, setFilterBranch] = useState<string>("All");
  const [filterBatch, setFilterBatch] = useState<string>("All");
  const [filterSemester, setFilterSemester] = useState<string>("All");
  
  const [showDownload, setShowDownload] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [activeGroupView, setActiveGroupView] = useState<any>(null);

  const branchOptions = ["All", ...BRANCHES];
  const batchOptions = ["All", ...BATCHES];
  const semesterOptions = ["All", ...SEMESTERS];

  const groupedLists = useMemo(() => {
    const groups: Record<string, {
      id: string;
      branch: string;
      batch: string;
      subject: string;
      semester: string;
      listIds: string[];
    }> = {};

    attendanceLists.forEach(l => {
      if (filterBranch !== "All" && l.branch !== filterBranch) return;
      if (filterBatch !== "All" && l.batch !== filterBatch) return;
      if (filterSemester !== "All" && l.semester !== filterSemester) return;

      const key = `${l.branch}-${l.batch}-${l.subject || 'N/A'}-${l.semester || 'N/A'}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          branch: l.branch,
          batch: l.batch,
          subject: l.subject || "N/A",
          semester: l.semester || "N/A",
          listIds: [l.id],
        };
      } else {
        groups[key].listIds.push(l.id);
      }
    });
    return Object.values(groups);
  }, [attendanceLists, filterBranch, filterBatch, filterSemester]);

  const handleDownload = async (fromDate: string, toDate: string) => {
    setShowDownload(false);
    if (!selectedGroup) return;
    try {
      let csvContent = "Government engineering college khagaria\n";
      csvContent += `Subject: ${selectedGroup.subject || "N/A"},Branch: ${selectedGroup.branch},Batch: ${selectedGroup.batch},Semester: ${selectedGroup.semester?.replace("Semester ", "Sem ") || "N/A"}\n`;

      const inRange = attendanceRecords.filter(r => 
        r.date >= fromDate && r.date <= toDate && 
        selectedGroup.listIds.includes(r.attendanceListId)
      );

      const uniqueDates = Array.from(new Set(inRange.map(r => r.date))).sort();
      
      const startDate = uniqueDates.length > 0 ? uniqueDates[0] : fromDate;
      const endDate = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : toDate;
      csvContent += `From: ${startDate},To: ${endDate}\n`;

      const headers = [
        "S.No",
        "Registration Number",
        "Name",
        "Present",
        "Total",
        "Percentage",
        ...uniqueDates
      ];
      csvContent += headers.join(",") + "\n";

      const batchStudents = students
        .filter((s) => s.branch === selectedGroup.branch && s.batch === selectedGroup.batch)
        .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));

      const recordMap: Record<string, Record<string, string>> = {};
      inRange.forEach((r) => {
        if (!recordMap[r.studentId]) recordMap[r.studentId] = {};
        recordMap[r.studentId][r.date] = r.status;
      });

      batchStudents.forEach((student, index) => {
        const studentRecords = recordMap[student.id] || {};
        let presentDays = 0;
        uniqueDates.forEach((date) => {
          if (studentRecords[date] === "Present") presentDays++;
        });

        const percentage = uniqueDates.length > 0 ? Math.round((presentDays / uniqueDates.length) * 100) : 0;

        const row = [
          (index + 1).toString(),
          student.registrationNumber,
          `"${student.name.replace(/"/g, '""')}"`,
          presentDays.toString(),
          uniqueDates.length.toString(),
          `${percentage}%`
        ];

        uniqueDates.forEach((date) => {
           row.push(studentRecords[date] || "Absent");
        });

        csvContent += row.join(",") + "\n";
      });

      if (batchStudents.length === 0 || uniqueDates.length === 0) {
        Alert.alert("No Data", "No attendance records found in the selected date range for this class.");
        return;
      }

      const filename = `attendance_${selectedGroup.branch}_${selectedGroup.batch}_${fromDate}_to_${toDate}.csv`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
        if (!directory) throw new Error("Unable to access file system");
        
        const path = `${directory}${filename}`;
        await FileSystem.writeAsStringAsync(path, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await Sharing.shareAsync(path, { mimeType: "text/csv", dialogTitle: "Save Attendance Report" });
        } else {
          Alert.alert("Saved", `Report saved to: ${path}`);
        }
      }
    } catch (e: any) {
      Alert.alert("Download Failed", e?.message || "Could not generate the report.");
    }
  };

  const bottomPad = Platform.OS === "web" ? 84 + 16 : insets.bottom + 82;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    filterSection: {
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10,
    },
    filterRow: { paddingHorizontal: 16, marginBottom: 8 },
    filterLabel: { fontSize: 11, fontWeight: "600", color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", marginBottom: 6, letterSpacing: 0.8, textTransform: "uppercase" },
    filterChipsRow: { flexDirection: "row", gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
    chipActive: { borderColor: colors.primary, backgroundColor: colors.accent },
    chipText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
    chipTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    listContent: { paddingBottom: bottomPad, paddingTop: 16 },
    listCard: {
      backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 16,
      borderRadius: colors.radius + 2, borderWidth: 1, borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    listCardHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    listIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    listTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    listSub: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginTop: 2 },
    statsSection: { padding: 14, gap: 10 },
    statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    statLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
    statValue: { fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    actionBtn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.accent, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.primary + "40" },
    actionBtnText: { fontSize: 14, fontWeight: "600", color: colors.primary, fontFamily: "Inter_600SemiBold" },
  });

  if (activeGroupView) {
    return <ReportGridView group={activeGroupView} onBack={() => setActiveGroupView(null)} />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="All Report" subtitle="Comprehensive attendance data" />

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, { paddingRight: 16 }]}>
          <View>
            <Text style={styles.filterLabel}>Branch</Text>
            <View style={styles.filterChipsRow}>
              {branchOptions.map(b => (
                <TouchableOpacity key={b} style={[styles.chip, filterBranch === b && styles.chipActive]} onPress={() => setFilterBranch(b)}>
                  <Text style={[styles.chipText, filterBranch === b && styles.chipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, { paddingRight: 16 }]}>
          <View>
            <Text style={styles.filterLabel}>Batch</Text>
            <View style={styles.filterChipsRow}>
              {batchOptions.map(b => (
                <TouchableOpacity key={b} style={[styles.chip, filterBatch === b && styles.chipActive]} onPress={() => setFilterBatch(b)}>
                  <Text style={[styles.chipText, filterBatch === b && styles.chipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, { paddingRight: 16, marginBottom: 0 }]}>
          <View>
            <Text style={styles.filterLabel}>Semester</Text>
            <View style={styles.filterChipsRow}>
              {semesterOptions.map(s => {
                const label = s === "All" ? "All" : s.replace("Semester ", "Sem ");
                return (
                  <TouchableOpacity key={s} style={[styles.chip, filterSemester === s && styles.chipActive]} onPress={() => setFilterSemester(s)}>
                    <Text style={[styles.chipText, filterSemester === s && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={groupedLists}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={groupedLists.length > 0}
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title="No reports found"
            description="No attendance records match your filters"
          />
        }
        renderItem={({ item: group }) => {
          const groupRecords = attendanceRecords.filter(r => group.listIds.includes(r.attendanceListId));
          const uniqueDates = [...new Set(groupRecords.map(r => r.date))].sort();
          const batchStudents = students.filter(s => s.branch === group.branch && s.batch === group.batch);

          let dateRangeText = "No records";
          if (uniqueDates.length > 0) {
            const startD = new Date(uniqueDates[0] + "T00:00:00");
            const endD = new Date(uniqueDates[uniqueDates.length - 1] + "T00:00:00");
            
            const formatM = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
            
            if (formatM(startD) === formatM(endD)) {
              dateRangeText = formatM(startD);
            } else {
              dateRangeText = `${formatM(startD)} - ${formatM(endD)}`;
            }
          }

          return (
            <View style={styles.listCard}>
              <View style={styles.listCardHeader}>
                <View style={styles.listIcon}>
                  <Feather name="file-text" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{group.branch} — {group.batch}</Text>
                  <Text style={styles.listSub}>{group.subject} · {group.semester}</Text>
                </View>
              </View>
              
              <View style={styles.statsSection}>
                 <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Total Students:</Text>
                    <Text style={styles.statValue}>{batchStudents.length}</Text>
                 </View>
                 <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Recorded Days:</Text>
                    <Text style={styles.statValue}>{uniqueDates.length} days</Text>
                 </View>
                 <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Active Period:</Text>
                    <Text style={styles.statValue}>{dateRangeText}</Text>
                 </View>
                 
                 <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                   <TouchableOpacity 
                    style={[styles.actionBtn, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setActiveGroupView(group)}
                   >
                     <Feather name="eye" size={16} color={colors.foreground} />
                     <Text style={[styles.actionBtnText, { color: colors.foreground }]}>View Report</Text>
                   </TouchableOpacity>

                   <TouchableOpacity 
                    style={[styles.actionBtn, { flex: 1 }]}
                    onPress={() => {
                      setSelectedGroup(group);
                      setShowDownload(true);
                    }}
                  >
                    <Feather name="download" size={16} color={colors.primary} />
                    <Text style={styles.actionBtnText}>Download</Text>
                  </TouchableOpacity>
                 </View>
              </View>
            </View>
          );
        }}
      />

      <DateRangeModal
        visible={showDownload}
        onClose={() => setShowDownload(false)}
        onDownload={handleDownload}
      />
    </View>
  );
}
