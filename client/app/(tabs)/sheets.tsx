import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "../../components/EmptyState";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useApp } from "../../context/AppContext";
import { useColors } from "../../hooks/useColors";
import { AttendanceList } from "../../types";

function SheetGridView({
  list,
  onBack,
}: {
  list: AttendanceList;
  onBack: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, attendanceRecords, getListDetails } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);

  const listId = (list as any)._id || list.id;

  React.useEffect(() => {
    getListDetails(listId);
  }, [listId, getListDetails]);

  const batchStudents = useMemo(
    () =>
      students
        .filter((s) => s.listId === listId)
        .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber)),
    [students, listId]
  );

  const listRecords = useMemo(
    () => attendanceRecords.filter((r) => r.attendanceListId === list.id),
    [attendanceRecords, list.id]
  );

  const dates = useMemo(() => {
    const uniqueDates = Array.from(new Set(listRecords.map((r) => r.date))).sort();
    return uniqueDates.length > 0 ? [uniqueDates[uniqueDates.length - 1]] : [];
  }, [listRecords]);

  // Pre-compute map for fast lookup: map[studentId][date] -> 'Present' | 'Absent'
  const recordMap = useMemo(() => {
    const map: Record<string, Record<string, "Present" | "Absent">> = {};
    listRecords.forEach((r) => {
      if (!map[r.studentId]) map[r.studentId] = {};
      map[r.studentId][r.date] = r.status;
    });
    return map;
  }, [listRecords]);



  const formatDateShort = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      let csvContent = "Government engineering college khagaria\n";
      csvContent += `Subject: ${list.subject || "N/A"},Branch: ${list.branch},Batch: ${list.batch},Semester: ${list.semester?.replace("Semester ", "Sem ") || "N/A"}\n`;

      const startDate = dates.length > 0 ? formatDateShort(dates[0]) : "N/A";
      csvContent += `Date: ${startDate}\n`;
      
      const headers = [
        "S.No",
        "Registration Number",
        "Name",
        "Status"
      ];
      csvContent += headers.join(",") + "\n";

      batchStudents.forEach((student, index) => {
        const studentRecords = recordMap[student.id] || {};
        const status = studentRecords[dates[0]] || "Absent";

        const row = [
          (index + 1).toString(),
          student.registrationNumber,
          `"${student.name.replace(/"/g, '""')}"`,
          status
        ];

        csvContent += row.join(",") + "\n";
      });

      const timestamp = Date.now();
      const filename = `attendance_${list.branch}_${list.batch}_${timestamp}.csv`;

      if (Platform.OS === "web") {
        // Web: create blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert("Success", "File downloaded successfully!");
      } else {
        // Mobile: use FileSystem directly (no casting to any)
        const directory =
          FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

        if (!directory) {
          throw new Error("Unable to access file system");
        }

        const filePath = `${directory}${filename}`;

        await FileSystem.writeAsStringAsync(filePath, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists) {
          throw new Error("File was not created successfully");
        }

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(filePath, {
            mimeType: "text/csv",
            dialogTitle: "Save Attendance Sheet",
          });
        } else {
          Alert.alert("File Saved", `File saved to: ${filePath}`);
        }
      }
    } catch (error: any) {
      console.error("Download error:", error);
      Alert.alert(
        "Download Failed",
        error?.message || "Could not generate the sheet. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const bottomPad = Platform.OS === "web" ? 84 + 16 : insets.bottom + 82;
  const ROW_HEIGHT = 44;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 16,
      paddingTop:
        Platform.OS === "web"
          ? Math.max(insets.top, 67) + 12
          : insets.top + 12,
      paddingBottom: 14,
    },
    backRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.secondary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
    },
    backText: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    downloadBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#22c55e",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      minWidth: 120,
      justifyContent: "center",
    },
    downloadBtnDisabled: {
      opacity: 0.7,
    },
    downloadText: {
      fontSize: 13,
      color: "#ffffff",
      fontFamily: "Inter_600SemiBold",
    },
    listTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    listSub: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },

    gridContainer: { flex: 1, backgroundColor: colors.background },
    headerRow: {
      flexDirection: "row",
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
      height: ROW_HEIGHT,
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: ROW_HEIGHT,
    },

    fixedWrap: {
      borderRightWidth: 2,
      borderRightColor: colors.border,
      backgroundColor: colors.card,
      zIndex: 1,
    },
    fixedCell: {
      height: ROW_HEIGHT,
      justifyContent: "center",
      paddingHorizontal: 10,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    fixedHeaderCell: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },

    cellName: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    cellReg: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    percentageCell: {
      fontSize: 13,
      fontWeight: "700",
      color: "#16a34a",
      fontFamily: "Inter_700Bold",
    },
    percentageHeaderCell: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },

    headerDateCell: {
      width: 70,
      height: ROW_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.card,
    },
    headerDateText: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
    },

    dataCell: {
      width: 70,
      minHeight: ROW_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    statusText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },

    emptyText: {
      padding: 32,
      textAlign: "center",
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },

    scrollViewContent: {
      flexDirection: "row",
    },
    scrollViewHorizontal: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.backRow, { justifyContent: "space-between" }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={14} color={colors.foreground} />
            <Text style={styles.backText}>All Today's Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.downloadBtn,
              isDownloading && styles.downloadBtnDisabled,
            ]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.downloadText}>Downloading...</Text>
              </>
            ) : (
              <>
                <Feather name="download" size={14} color="#ffffff" />
                <Text style={styles.downloadText}>Download CSV</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.listTitle}>
          {list.subject
            ? `${list.subject} (${list.semester?.replace("Semester", "Sem")})`
            : `${list.branch} — ${list.batch}`}
        </Text>
        <Text style={styles.listSub}>
          {list.subject
            ? `${list.branch} — ${list.batch}`
            : ""}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {batchStudents.length === 0 ? (
          <Text style={styles.emptyText}>No students in this list.</Text>
        ) : dates.length === 0 ? (
          <Text style={styles.emptyText}>
            No attendance records marked yet.
          </Text>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: bottomPad }}
          >
            <ScrollView
              horizontal
              bounces={false}
              showsHorizontalScrollIndicator={true}
              style={styles.scrollViewHorizontal}
            >
              <View style={styles.scrollViewContent}>
                {/* Left Fixed Columns */}
                <View style={styles.fixedWrap}>
                  {/* Header Row */}
                  <View
                    style={[
                      styles.row,
                      {
                        borderBottomWidth: 2,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.fixedCell, { width: 50 }]}>
                      <Text style={styles.fixedHeaderCell}>S.No</Text>
                    </View>
                    <View style={[styles.fixedCell, { width: 110 }]}>
                      <Text style={styles.fixedHeaderCell}>Reg No</Text>
                    </View>
                    <View style={[styles.fixedCell, { width: 140 }]}>
                      <Text style={styles.fixedHeaderCell}>Name</Text>
                    </View>
                  </View>

                  {/* Data Rows */}
                  {batchStudents.map((s, idx) => {
                    return (
                      <View key={s.id} style={styles.row}>
                        <View style={[styles.fixedCell, { width: 50 }]}>
                          <Text style={styles.cellReg}>{idx + 1}</Text>
                        </View>
                        <View style={[styles.fixedCell, { width: 110 }]}>
                          <Text style={styles.cellReg} numberOfLines={1}>
                            {s.registrationNumber}
                          </Text>
                        </View>
                        <View style={[styles.fixedCell, { width: 140 }]}>
                          <Text style={styles.cellName} numberOfLines={1}>
                            {s.name}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Right Scrollable Columns - Dates */}
                <View>
                  {/* Date Headers */}
                  <View style={styles.headerRow}>
                    {dates.map((d) => (
                      <View key={d} style={styles.headerDateCell}>
                        <Text style={styles.headerDateText}>
                          {formatDateShort(d)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Attendance Data Rows */}
                  {batchStudents.map((s) => (
                    <View key={s.id} style={styles.row}>
                      {dates.map((d) => {
                        const status = recordMap[s.id]?.[d];
                        const isPresent = status === "Present";
                        const text = isPresent
                          ? "P"
                          : status === "Absent"
                          ? "A"
                          : "-";
                        const color = isPresent
                          ? "#16a34a"
                          : status === "Absent"
                          ? "#dc2626"
                          : colors.mutedForeground;

                        return (
                          <View key={d} style={styles.dataCell}>
                            <Text style={[styles.statusText, { color }]}>
                              {text}
                            </Text>
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

export default function SheetsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { attendanceLists, students,attendanceRecords } = useApp();
  const [activeList, setActiveList] = useState<AttendanceList | null>(null);

  const sorted = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return attendanceLists
      .filter((list) => {
        const listId = (list as any)._id || list.id;
        return attendanceRecords.some((r) => r.attendanceListId === listId && r.date === today);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [attendanceLists, attendanceRecords]);

  const bottomPad = Platform.OS === "web" ? 84 + 16 : insets.bottom + 82;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 10,
      borderRadius: colors.radius + 2,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 11,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    cardSub: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    studentCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 8,
      backgroundColor: colors.accent,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    studentCountText: {
      fontSize: 11,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    viewBtn: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.secondary,
      paddingVertical: 10,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
    },
    viewBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    listContent: { paddingBottom: bottomPad, paddingTop: 4 },
  });

  if (activeList) {
    return <SheetGridView list={activeList} onBack={() => setActiveList(null)} />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Today's Attendance"
        subtitle="View consolidated attendance grids"
      />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={sorted.length > 0}
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title="No Attendance Available"
            description="Mark students and view today’s attendance."
          />
        }
        renderItem={({ item }) => {
          const listId = (item as any)._id || item.id;
          const batchStudentCount = students.filter(
            (s) => s.listId === listId
          ).length;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Feather name="file-text" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {item.subject
                      ? `${item.subject} (${item.semester?.replace("Semester", "Sem")})`
                      : `${item.branch} — ${item.batch}`}
                  </Text>
                  <Text style={styles.cardSub}>
                    {item.subject
                      ? `${item.branch} — ${item.batch}`
                      : ""}
                  </Text>
                </View>
              </View>
              <View style={styles.studentCount}>
                <Feather name="users" size={11} color={colors.primary} />
                <Text style={styles.studentCountText}>
                  {batchStudentCount} student
                  {batchStudentCount !== 1 ? "s" : ""}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => setActiveList(item)}
                activeOpacity={0.8}
              >
                <Feather name="eye" size={14} color={colors.foreground} />
                <Text style={styles.viewBtnText}>View Sheet Data</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}