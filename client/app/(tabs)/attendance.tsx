import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarPicker } from "../../components/CalendarPicker";
import { EmptyState } from "../../components/EmptyState";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StudentFormModal } from "../../components/StudentFormModal";
import { useApp } from "../../context/AppContext";
import { useColors } from "../../hooks/useColors";
import { AttendanceList, AttendanceRecord, BATCHES, BRANCHES, MONTHS, SEMESTERS } from "../../types";
import { Student } from "../../types";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function CreateListModal({
  visible,
  onClose,
  onCreate,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (branch: string, batch: string, subject: string, semester: string) => void;
  initial?: AttendanceList | null;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [branch, setBranch] = useState(initial ? initial.branch : BRANCHES[0]);
  const [batch, setBatch] = useState(initial ? initial.batch : BATCHES[2]);
  const [subject, setSubject] = useState(initial ? initial.subject || "" : "");
  const [semester, setSemester] = useState(initial ? initial.semester || SEMESTERS[0] : SEMESTERS[0]);

  React.useEffect(() => {
    if (initial) {
      setBranch(initial.branch);
      setBatch(initial.batch);
      setSubject(initial.subject || "");
      setSemester(initial.semester || SEMESTERS[0]);
    } else {
      setBranch(BRANCHES[0]);
      setBatch(BATCHES[2]);
      setSubject("");
      setSemester(SEMESTERS[0]);
    }
  }, [initial, visible]);

  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
      maxHeight: "90%",
    },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginTop: 12, marginBottom: 8 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    title: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", flex: 1 },
    body: { paddingHorizontal: 20, paddingTop: 16 },
    label: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
    input: {
      borderWidth: 1.5, borderColor: colors.border, borderRadius: colors.radius,
      paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
      color: colors.foreground, fontFamily: "Inter_400Regular",
      backgroundColor: colors.background, marginBottom: 18,
    },
    row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
    chipActive: { borderColor: colors.primary, backgroundColor: colors.accent },
    chipText: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
    chipTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    submitBtn: { backgroundColor: colors.primary, borderRadius: colors.radius, paddingVertical: 14, alignItems: "center", marginHorizontal: 20, marginTop: 8, marginBottom: 8 },
    submitBtnText: { fontSize: 15, fontWeight: "700", color: "#ffffff", fontFamily: "Inter_700Bold" },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>{initial ? "Edit List" : "Create Attendance List"}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>Subject Name</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. Physics, Data Structures"
                  placeholderTextColor={colors.mutedForeground}
                />
                
                <Text style={styles.label}>Semester</Text>
                <View style={styles.row}>
                  {SEMESTERS.map(s => (
                    <TouchableOpacity key={s} style={[styles.chip, semester === s && styles.chipActive]} onPress={() => setSemester(s)}>
                      <Text style={[styles.chipText, semester === s && styles.chipTextActive]}>{s.replace("Semester ", "Sem ")}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Branch</Text>
              <View style={styles.row}>
                {BRANCHES.map(b => (
                  <TouchableOpacity key={b} style={[styles.chip, branch === b && styles.chipActive]} onPress={() => setBranch(b)}>
                    <Text style={[styles.chipText, branch === b && styles.chipTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Batch</Text>
              <View style={styles.row}>
                {BATCHES.map(b => (
                  <TouchableOpacity key={b} style={[styles.chip, batch === b && styles.chipActive]} onPress={() => setBatch(b)}>
                    <Text style={[styles.chipText, batch === b && styles.chipTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 8 }} />
            </ScrollView>
            <TouchableOpacity 
              style={[styles.submitBtn, !subject.trim() && { opacity: 0.5 }]} 
              onPress={() => { onCreate(branch, batch, subject.trim(), semester); onClose(); }}
              disabled={!subject.trim()}
            >
              <Text style={styles.submitBtnText}>{initial ? "Save Changes" : "Create List"}</Text>
            </TouchableOpacity>
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Shimmer loader component for AttendanceMarkView
function AttendanceMarkShimmer({ colors }: { colors: any }) {
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "web" ? 67 + 12 : 12,
      paddingBottom: 14,
    },
    backRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    backBtnShimmer: {
      width: 100,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.mutedForeground + "30",
    },
    addBtnShimmer: {
      width: 100,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.mutedForeground + "30",
    },
    titleShimmer: {
      height: 20,
      width: "60%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
      marginBottom: 6,
    },
    subTitleShimmer: {
      height: 14,
      width: "40%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
    },
    dateBtnShimmer: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.mutedForeground + "30",
    },
    summaryBoxShimmer: {
      flex: 1,
      height: 70,
      borderRadius: 9,
      backgroundColor: colors.mutedForeground + "30",
    },
    bulkBtnShimmer: {
      flex: 1,
      height: 42,
      borderRadius: 9,
      backgroundColor: colors.mutedForeground + "30",
    },
    studentRowShimmer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    avatarShimmer: {
      width: 40,
      height: 40,
      borderRadius: 11,
      backgroundColor: colors.mutedForeground + "30",
      marginRight: 12,
    },
    studentInfoShimmer: { flex: 1 },
    nameShimmer: {
      height: 14,
      width: "60%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
      marginBottom: 6,
    },
    regShimmer: {
      height: 12,
      width: "40%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
    },
    toggleShimmer: {
      width: 70,
      height: 34,
      borderRadius: 20,
      backgroundColor: colors.mutedForeground + "30",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.backRow, { justifyContent: "space-between" }]}>
          <View style={styles.backBtnShimmer} />
          <View style={styles.addBtnShimmer} />
        </View>
        <View style={styles.titleShimmer} />
        <View style={styles.subTitleShimmer} />
        <View style={{ marginTop: 12 }}>
          <View style={styles.dateBtnShimmer} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.summaryBoxShimmer} />
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.bulkBtnShimmer} />
        ))}
      </View>

      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.studentRowShimmer}>
          <View style={styles.avatarShimmer} />
          <View style={styles.studentInfoShimmer}>
            <View style={styles.nameShimmer} />
            <View style={styles.regShimmer} />
          </View>
          <View style={styles.toggleShimmer} />
        </View>
      ))}
    </View>
  );
}

function AttendanceMarkView({
  list,
  onBack,
}: {
  list: AttendanceList;
  onBack: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students, attendanceRecords, saveAttendanceRecords, addStudent, addMultipleStudents, updateStudent, deleteStudent, getListDetails, isLoading } = useApp();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const listId = (list as any)._id || list.id;
  
  useEffect(() => {
    const loadDetails = async () => {
      setIsLoadingDetails(true);
      await getListDetails(listId);
      setIsLoadingDetails(false);
    };
    loadDetails();
  }, [listId, getListDetails]);

  const batchStudents = useMemo(() =>
    students.filter(s => s.listId === listId),
    [students, listId]
  );

  const listRecords = useMemo(() =>
    attendanceRecords.filter(r => r.attendanceListId === listId),
    [attendanceRecords, listId]
  );

  const markedDates = useMemo(() => {
    const map: Record<string, { present: number; absent: number }> = {};
    listRecords.forEach(r => {
      if (!map[r.date]) map[r.date] = { present: 0, absent: 0 };
      if (r.status === "Present") map[r.date].present++;
      else map[r.date].absent++;
    });
    return map;
  }, [listRecords]);

  const existingForDate = useMemo(() =>
    listRecords.filter(r => r.date === selectedDate),
    [listRecords, selectedDate]
  );

  const [statuses, setStatuses] = useState<Record<string, "Present" | "Absent">>(() => {
    const m: Record<string, "Present" | "Absent"> = {};
    batchStudents.forEach(s => { m[s.id] = "Absent"; });
    return m;
  });

  useEffect(() => {
    const m: Record<string, "Present" | "Absent"> = {};
    batchStudents.forEach(s => { m[s.id] = "Absent"; });
    existingForDate.forEach(r => { m[r.studentId] = r.status; });
    setStatuses(m);
  }, [batchStudents, existingForDate]);

  const presentCount = Object.values(statuses).filter(v => v === "Present").length;
  const absentCount = Object.values(statuses).filter(v => v === "Absent").length;

  const toggle = (studentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStatuses(prev => ({ ...prev, [studentId]: prev[studentId] === "Present" ? "Absent" : "Present" }));
  };

  const markAll = (status: "Present" | "Absent") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const m: Record<string, "Present" | "Absent"> = {};
    batchStudents.forEach(s => { m[s.id] = status; });
    setStatuses(m);
  };

  const handleSave = async () => {
    if (batchStudents.length === 0) return;

    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const records: AttendanceRecord[] = batchStudents.map((s) => ({
      id: generateId(),
      attendanceListId: listId,
      studentId: s.id,
      date: selectedDate,
      status: statuses[s.id] || "Absent",
    }));

    await saveAttendanceRecords(listId, records);

    setIsSaving(false);
    Alert.alert("Saved", `Attendance saved for ${selectedDate}.`);
  };

  const formatDate = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return d === today ? "Today" : dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const bottomPad = Platform.OS === "web" ? 84 + 16 : insets.bottom + 82;

  // Show shimmer loader while loading details
  if (isLoadingDetails || isLoading) {
    return <AttendanceMarkShimmer colors={colors} />;
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    topBar: {
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
      paddingHorizontal: 16, paddingTop: Platform.OS === "web" ? Math.max(insets.top, 67) + 12 : insets.top + 12,
      paddingBottom: 14,
    },
    backRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    backBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    },
    backText: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    addBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    },
    addText: { fontSize: 13, color: "#ffffff", fontFamily: "Inter_600SemiBold" },
    listTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    listSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    datePickerRow: {
      flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12,
    },
    dateBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.primary,
      borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
    },
    dateBtnText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.primary, fontFamily: "Inter_600SemiBold" },
    summaryRow: {
      flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10,
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    summaryBox: {
      flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: colors.background, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9,
      borderWidth: 1, borderColor: colors.border,
    },
    summaryVal: { fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    summaryLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    bulkRow: {
      flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 10,
      backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    bulkBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
      paddingVertical: 9, borderRadius: 9, borderWidth: 1.5,
    },
    bulkBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    studentRow: {
      flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13,
      borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card,
    },
    avatar: {
      width: 40, height: 40, borderRadius: 11,
      backgroundColor: colors.primary + "18", alignItems: "center", justifyContent: "center", marginRight: 12,
    },
    avatarText: { fontSize: 15, fontWeight: "700", color: colors.primary, fontFamily: "Inter_700Bold" },
    studentName: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    studentReg: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 },
    toggleBtn: {
      flexDirection: "row", alignItems: "center", gap: 5,
      paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
    },
    toggleText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    saveBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      paddingVertical: 14, alignItems: "center",
      flexDirection: "row", justifyContent: "center", gap: 8,
      marginHorizontal: 16, marginBottom: 8,
    },
    saveBtnText: { fontSize: 15, fontWeight: "700", color: "#ffffff", fontFamily: "Inter_700Bold" },
    noStudents: { textAlign: "center", paddingVertical: 32, color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 },
    calOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    calSheet: {
      backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
    },
    calTitle: { fontSize: 15, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12, textAlign: "center" },
    saveFloating: {
      position: "absolute", bottom: bottomPad, left: 16, right: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.backRow, { justifyContent: "space-between" }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={14} color={colors.foreground} />
            <Text style={styles.backText}>All Lists</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddStudent(true)}>
            <Feather name="user-plus" size={14} color="#ffffff" />
            <Text style={styles.addText}>Add Student</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.listTitle}>{list.subject ? `${list.subject} (${list.semester?.replace("Semester", "Sem")})` : `${list.branch} — ${list.batch}`}</Text>
        <Text style={styles.listSub}>{list.subject ? `${list.branch} — ${list.batch}` : ""}</Text>
        <View style={styles.datePickerRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowCalendar(true)} activeOpacity={0.7}>
            <Feather name="calendar" size={16} color={colors.primary} />
            <Text style={styles.dateBtnText}>{formatDate(selectedDate)}</Text>
            <Feather name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Feather name="check-circle" size={16} color="#16a34a" />
          <View>
            <Text style={[styles.summaryVal, { color: "#16a34a" }]}>{presentCount}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
        </View>
        <View style={styles.summaryBox}>
          <Feather name="x-circle" size={16} color="#dc2626" />
          <View>
            <Text style={[styles.summaryVal, { color: "#dc2626" }]}>{absentCount}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
        </View>
        <View style={styles.summaryBox}>
          <Feather name="users" size={16} color={colors.primary} />
          <View>
            <Text style={styles.summaryVal}>{batchStudents.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.bulkRow}>
        <TouchableOpacity style={[styles.bulkBtn, { borderColor: "#16a34a" }]} onPress={() => markAll("Present")}>
          <Feather name="check-circle" size={14} color="#16a34a" />
          <Text style={[styles.bulkBtnText, { color: "#16a34a" }]}>All Present</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bulkBtn, { borderColor: "#dc2626" }]} onPress={() => markAll("Absent")}>
          <Feather name="x-circle" size={14} color="#dc2626" />
          <Text style={[styles.bulkBtnText, { color: "#dc2626" }]}>All Absent</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={batchStudents}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: bottomPad + 60 }}
        scrollEnabled={batchStudents.length > 0}
        ListEmptyComponent={<Text style={styles.noStudents}>No students in {list.branch} · {list.batch}</Text>}
        renderItem={({ item }) => {
          const status = statuses[item.id] || "Absent";
          const isPresent = status === "Present";
          return (
            <View style={styles.studentRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentReg}>{item.registrationNumber}</Text>
              </View>
              <TouchableOpacity style={{ padding: 6, marginRight: 10 }} onPress={() => setStudentToEdit(item)}>
                <Feather name="edit-2" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, {
                  borderColor: isPresent ? "#16a34a" : "#dc2626",
                  backgroundColor: isPresent ? "#f0fdf4" : "#fef2f2",
                }]}
                onPress={() => toggle(item.id)}
              >
                <Feather name={isPresent ? "check" : "x"} size={13} color={isPresent ? "#16a34a" : "#dc2626"} />
                <Text style={[styles.toggleText, { color: isPresent ? "#16a34a" : "#dc2626" }]}>{status}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {batchStudents.length > 0 && (
        <View style={styles.saveFloating}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving} activeOpacity={0.85}>
            <Feather name="save" size={16} color="#ffffff" />
            <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Attendance"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showCalendar} transparent animationType="slide" onRequestClose={() => setShowCalendar(false)}>
        <TouchableOpacity style={styles.calOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.calSheet}>
              <Text style={styles.calTitle}>Select Date</Text>
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={(date) => { setSelectedDate(date); setShowCalendar(false); }}
                markedDates={markedDates}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <StudentFormModal
        visible={showAddStudent || studentToEdit !== null}
        onClose={() => { setShowAddStudent(false); setStudentToEdit(null); }}
        lockedContext={{ branch: list.branch, batch: list.batch }}
        initial={studentToEdit}
        onSubmit={async (data) => {
          if (!listId) {
            Alert.alert("Error", "List ID is missing");
            return;
          }
          if (studentToEdit) {
            await updateStudent(listId, studentToEdit.registrationNumber, data);
          } else {
            await addStudent(listId, data);
          }
          setShowAddStudent(false);
          setStudentToEdit(null);
        }}
        onDelete={studentToEdit ? () => {
          Alert.alert("Delete Student", `Delete ${studentToEdit.name}?`, [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Delete", 
              style: "destructive", 
              onPress: async () => {
                if (!listId) {
                  Alert.alert("Error", "List ID is missing");
                  return;
                }
                await deleteStudent(listId, studentToEdit.registrationNumber);
                setStudentToEdit(null);
              }
            }
          ]);
        } : undefined}
        onBulkSubmit={async (studentsData) => {
          if (!listId) {
            Alert.alert("Error", "List ID is missing");
            return;
          }
          await addMultipleStudents(listId, studentsData);
          setShowAddStudent(false);
        }}
      />
    </View>
  );
}

// Shimmer loader for main AttendanceScreen
function AttendanceListShimmer({ colors }: { colors: any }) {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 10,
      borderRadius: colors.radius + 2,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardIconShimmer: {
      width: 40,
      height: 40,
      borderRadius: 11,
      backgroundColor: colors.mutedForeground + "30",
    },
    cardContentShimmer: { flex: 1 },
    titleShimmer: {
      height: 16,
      width: "70%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
      marginBottom: 6,
    },
    subTitleShimmer: {
      height: 12,
      width: "50%",
      borderRadius: 4,
      backgroundColor: colors.mutedForeground + "30",
    },
    studentCountShimmer: {
      height: 22,
      width: 80,
      borderRadius: 8,
      backgroundColor: colors.mutedForeground + "30",
      marginTop: 8,
    },
    actionsShimmer: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    actionBtnShimmer: {
      flex: 1,
      height: 40,
      borderRadius: 9,
      backgroundColor: colors.mutedForeground + "30",
    },
    actionIconShimmer: {
      width: 40,
      height: 40,
      borderRadius: 9,
      backgroundColor: colors.mutedForeground + "30",
    },
  });

  return (
    <FlatList
      data={[1, 2, 3]}
      keyExtractor={(item) => item.toString()}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
      renderItem={() => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconShimmer} />
            <View style={styles.cardContentShimmer}>
              <View style={styles.titleShimmer} />
              <View style={styles.subTitleShimmer} />
            </View>
          </View>
          <View style={styles.studentCountShimmer} />
          <View style={styles.actionsShimmer}>
            <View style={styles.actionBtnShimmer} />
            <View style={styles.actionIconShimmer} />
            <View style={styles.actionIconShimmer} />
            <View style={styles.actionIconShimmer} />
          </View>
        </View>
      )}
    />
  );
}

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { attendanceLists, addAttendanceList, updateAttendanceList, deleteAttendanceList, students, addStudent, addMultipleStudents, isLoading, loadData } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [activeList, setActiveList] = useState<AttendanceList | null>(null);
  const [listToAddStudent, setListToAddStudent] = useState<AttendanceList | null>(null);
  const [listToEdit, setListToEdit] = useState<AttendanceList | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const sorted = useMemo(() =>
    [...attendanceLists].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [attendanceLists]
  );

  const handleCreate = async (branch: string, batch: string, subject: string, semester: string) => {
    const list = await addAttendanceList({ branch, batch, subject, semester });
    if (list) {
      setActiveList(list);
    }
  };

  const handleDelete = (list: AttendanceList) => {
    const listId = (list as any)._id || list.id;
    Alert.alert("Delete List", `Delete ${list.branch} ${list.batch}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAttendanceList(listId) },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const bottomPad = Platform.OS === "web" ? 84 + 16 : insets.bottom + 82;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    card: {
      backgroundColor: colors.card, marginHorizontal: 16, marginTop: 10,
      borderRadius: colors.radius + 2, borderWidth: 1, borderColor: colors.border, padding: 14,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    cardIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    cardTitle: { fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    cardSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    studentCount: {
      flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8,
      backgroundColor: colors.accent, alignSelf: "flex-start",
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    studentCountText: { fontSize: 11, color: colors.primary, fontFamily: "Inter_600SemiBold" },
    cardActions: { marginTop: 12, flexDirection: "row", gap: 8 },
    markBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
      backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 9,
    },
    markBtnText: { fontSize: 13, fontWeight: "600", color: "#ffffff", fontFamily: "Inter_600SemiBold" },
    addStudentBtn: {
      width: 40, flexDirection: "row", alignItems: "center", justifyContent: "center",
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 9, backgroundColor: colors.accent,
    },
    editBtn: {
      width: 40, flexDirection: "row", alignItems: "center", justifyContent: "center",
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 9,
    },
    deleteBtn: {
      width: 40, flexDirection: "row", alignItems: "center", justifyContent: "center",
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 9,
    },
    listContent: { paddingBottom: bottomPad, paddingTop: 4 },
  });

  if (activeList) {
    return <AttendanceMarkView list={activeList} onBack={() => setActiveList(null)} />;
  }

  // Show shimmer loader while loading data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Attendance"
          subtitle="Manage attendance lists"
          rightAction={{ icon: "plus", onPress: () => setShowCreate(true) }}
        />
        <AttendanceListShimmer colors={colors} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Attendance"
        subtitle="Manage attendance lists"
        rightAction={{ icon: "plus", onPress: () => setShowCreate(true) }}
      />
      <FlatList
        data={sorted}
        keyExtractor={(item) => ((item as any)._id || item.id).toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={sorted.length > 0}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="check-square"
            title="No attendance lists"
            description="Create a list to start marking attendance for a branch and batch"
            actionLabel="Create List"
            onAction={() => setShowCreate(true)}
          />
        }
        renderItem={({ item }) => {
          const listId = (item as any)._id || item.id;
          const listStudents = students.filter(s => s.listId === listId);
          const batchStudentCount = listStudents.length;
          
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Feather name="list" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.subject ? `${item.subject} (${item.semester?.replace("Semester", "Sem")})` : `${item.branch} — ${item.batch}`}</Text>
                  <Text style={styles.cardSub}>{item.subject ? `${item.branch} — ${item.batch}` : ""}</Text>
                </View>
              </View>
              <View style={styles.studentCount}>
                <Feather name="users" size={11} color={colors.primary} />
                <Text style={styles.studentCountText}>
                  {batchStudentCount} student{batchStudentCount !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={[styles.markBtn, batchStudentCount === 0 && { opacity: 0.5 }]} 
                  onPress={() => batchStudentCount > 0 && setActiveList(item)} 
                  activeOpacity={0.8}
                  disabled={batchStudentCount === 0}
                >
                  <Feather name="edit-3" size={14} color="#ffffff" />
                  <Text style={styles.markBtnText}>Mark Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addStudentBtn} 
                  onPress={() => setListToAddStudent(item)} 
                  activeOpacity={0.7}
                >
                  <Feather name="user-plus" size={15} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => setListToEdit(item)} activeOpacity={0.7}>
                  <Feather name="edit-2" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.7}>
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      <CreateListModal
        visible={showCreate || listToEdit !== null}
        onClose={() => { setShowCreate(false); setListToEdit(null); }}
        initial={listToEdit}
        onCreate={async (branch, batch, subject, semester) => {
          if (listToEdit) {
            const listId = (listToEdit as any)._id || (listToEdit as any).id;
            const updated = await updateAttendanceList(listId, { branch, batch, subject, semester });
            if ((activeList as any)?._id === (listToEdit as any)._id || (activeList as any)?.id === (listToEdit as any).id) {
              setActiveList(updated || null);
            }
          } else {
            await handleCreate(branch, batch, subject, semester);
          }
          setListToEdit(null);
          setShowCreate(false);
        }}
      />
      <StudentFormModal
        visible={listToAddStudent !== null}
        onClose={() => setListToAddStudent(null)}
        lockedContext={listToAddStudent ? { branch: listToAddStudent.branch, batch: listToAddStudent.batch } : null}
        onSubmit={async (data) => {
          if (listToAddStudent) {
            const listId = (listToAddStudent as any)._id || listToAddStudent.id;
            if (!listId) {
              Alert.alert("Error", "List ID is missing");
              return;
            }
            await addStudent(listId, data);
          }
          setListToAddStudent(null);
        }}
        onBulkSubmit={async (studentsData) => {
          if (listToAddStudent) {
            const listId = (listToAddStudent as any)._id || listToAddStudent.id;
            if (!listId) {
              Alert.alert("Error", "List ID is missing");
              return;
            }
            await addMultipleStudents(listId, studentsData);
          }
          setListToAddStudent(null);
        }}
      />
    </View>
  );
}