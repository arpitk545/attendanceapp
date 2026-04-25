import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BATCHES, BRANCHES, Student } from "../types";
import { useColors } from "../hooks/useColors";

interface StudentFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, "id" | "createdAt">) => void;
  initial?: Student | null;
  lockedContext?: { branch: string; batch: string } | null;
  onBulkSubmit?: (students: Omit<Student, "id" | "createdAt">[]) => void;
  onDelete?: () => void;
}

export function StudentFormModal({ 
  visible, 
  onClose, 
  onSubmit, 
  onBulkSubmit, 
  initial, 
  lockedContext, 
  onDelete 
}: StudentFormModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [regNumber, setRegNumber] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [batch, setBatch] = useState(BATCHES[2]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initial) {
      setRegNumber(initial.registrationNumber);
      setName(initial.name);
      setBranch(initial.branch as any);
      setBatch(initial.batch);
    } else {
      setRegNumber("");
      setName("");
      setBranch(lockedContext ? (lockedContext.branch as any) : BRANCHES[0]);
      setBatch(lockedContext ? lockedContext.batch : BATCHES[2]);
    }
  }, [initial, visible, lockedContext]);

  const handleSubmit = () => {
    if (!regNumber.trim() || !name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit({ registrationNumber: regNumber.trim(), name: name.trim(), branch, batch });
    onClose();
  };

  const validateExcelData = (data: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data || data.length === 0) {
      errors.push("No data found in file");
      return { valid: false, errors };
    }

    // Check for minimum required columns
    const firstRow = data[0];
    const hasNameColumn = Object.keys(firstRow).some(key => 
      key.toLowerCase().replace(/[^a-z]/g, '') === 'name' || 
      key.toLowerCase().includes('studentname')
    );
    
    const hasRegColumn = Object.keys(firstRow).some(key => 
      key.toLowerCase().replace(/[^a-z]/g, '') === 'registrationnumber' || 
      key.toLowerCase().replace(/[^a-z]/g, '') === 'regno' || 
      key.toLowerCase().replace(/[^a-z]/g, '') === 'rollno'
    );

    if (!hasNameColumn) {
      errors.push("Missing 'Name' column");
    }
    if (!hasRegColumn) {
      errors.push("Missing 'Registration Number' column");
    }

    return { valid: hasNameColumn && hasRegColumn, errors };
  };

  const processExcelData = (data: any[]): Omit<Student, "id" | "createdAt">[] => {
    const studentsToAdd: Omit<Student, "id" | "createdAt">[] = [];
    const skippedRows: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const keys = Object.keys(row);
      
      const nameKey = keys.find(k => 
        k.toLowerCase().replace(/[^a-z]/g, '') === 'name' || 
        k.toLowerCase().includes('studentname')
      );
      
      const regKey = keys.find(k => 
        k.toLowerCase().replace(/[^a-z]/g, '') === 'registrationnumber' || 
        k.toLowerCase().replace(/[^a-z]/g, '') === 'regno' || 
        k.toLowerCase().replace(/[^a-z]/g, '') === 'rollno'
      );

      if (nameKey && regKey && row[nameKey] && row[regKey]) {
        const studentName = String(row[nameKey]).trim();
        const studentRegNumber = String(row[regKey]).trim();
        
        if (studentName && studentRegNumber) {
          studentsToAdd.push({
            name: studentName,
            registrationNumber: studentRegNumber,
            branch: branch,
            batch: batch,
          });
        } else {
          skippedRows.push(i + 2); // +2 for 1-indexed and header row
        }
      } else {
        skippedRows.push(i + 2);
      }
    }

    if (skippedRows.length > 0 && studentsToAdd.length > 0) {
      Alert.alert(
        "Partial Import", 
        `Skipped ${skippedRows.length} row(s) (rows ${skippedRows.join(", ")}) due to missing or invalid data. Imported ${studentsToAdd.length} student(s).`
      );
    }

    return studentsToAdd;
  };

  const handleUpload = async () => {
    if (uploading) return;
    setUploading(true);

    try {
      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'application/vnd.ms-excel.sheet.macroEnabled.12'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setUploading(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name || "file";
      
      // Check file extension
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        Alert.alert("Invalid Format", "Please select an Excel (.xlsx, .xls) or CSV (.csv) file");
        setUploading(false);
        return;
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      // Check file size (max 10MB)
      if (fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
        Alert.alert("File Too Large", "Please select a file smaller than 10MB");
        setUploading(false);
        return;
      }

      // Read file as base64
      let base64: string;
     try {
  base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: "base64",
  });
} catch (readError) {
  console.error("File read error:", readError);
  throw new Error("Could not read the file. Please check if the file is accessible.");
}

      if (!base64 || base64.length === 0) {
        throw new Error("File is empty or could not be read");
      }

      // Parse Excel file
      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(base64, { 
          type: 'base64',
          cellDates: false,
          cellNF: false,
          cellText: false
        });
      } catch (parseError) {
        console.error("XLSX parse error:", parseError);
        throw new Error("The file appears to be corrupted or in an unsupported format. Please try saving it as a new Excel file.");
      }

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("No sheets found in the workbook");
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      if (!worksheet) {
        throw new Error("Could not access the worksheet");
      }

      // Convert to JSON
      let data: any[];
      try {
        data = XLSX.utils.sheet_to_json(worksheet, { 
          defval: "",
          blankrows: false 
        });
      } catch (convertError) {
        console.error("JSON conversion error:", convertError);
        throw new Error("Failed to convert spreadsheet data. Please check the file format.");
      }

      // Validate data
      const validation = validateExcelData(data);
      if (!validation.valid) {
        Alert.alert(
          "Invalid File Format",
          `The file format is incorrect.\n\nMissing columns:\n${validation.errors.join("\n")}\n\nRequired columns: "Name" and "Registration Number" (or "Reg No"/"Roll No")`
        );
        setUploading(false);
        return;
      }

      // Process data
      const studentsToAdd = processExcelData(data);

      if (studentsToAdd.length === 0) {
        Alert.alert(
          "No Valid Data", 
          "No valid student records found in the file. Please ensure each row has both Name and Registration Number."
        );
        setUploading(false);
        return;
      }

      // Confirm before adding
      Alert.alert(
        "Confirm Upload",
        `Found ${studentsToAdd.length} student(s) to add.\n\nBranch: ${branch}\nBatch: ${batch}\n\nDo you want to proceed?`,
        [
          { text: "Cancel", style: "cancel", onPress: () => setUploading(false) },
          {
            text: "Add Students",
            onPress: async () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (onBulkSubmit) {
                onBulkSubmit(studentsToAdd);
              } else {
                Alert.alert("Notice", "Bulk upload is not supported in this view.");
              }
              onClose();
              setUploading(false);
            }
          }
        ]
      );
      
    } catch (e: any) {
      console.error("Upload error details:", e);
      
      let errorMessage = "Failed to process the file.";
      if (e.message?.includes("base64") || e.message?.includes("readAsString")) {
        errorMessage = "Failed to read the file. Please try a different file or check file permissions.";
      } else if (e.message?.includes("Unsupported file")) {
        errorMessage = "Unsupported file format. Please use .xlsx, .xls, or .csv files.";
      } else if (e.message?.includes("corrupted")) {
        errorMessage = "The file appears to be corrupted. Please try opening and re-saving it in Excel.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      Alert.alert("Upload Error", errorMessage);
      setUploading(false);
    }
  };

  const styles = StyleSheet.create({
    overlay: { 
      flex: 1, 
      backgroundColor: "rgba(0,0,0,0.55)", 
      justifyContent: "flex-end" 
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
      maxHeight: Platform.OS === "web" ? "90%" : "100%",
    },
    handle: {
      width: 36, 
      height: 4, 
      borderRadius: 2,
      backgroundColor: colors.border, 
      alignSelf: "center", 
      marginTop: 12, 
      marginBottom: 8,
    },
    header: {
      flexDirection: "row", 
      alignItems: "center",
      paddingHorizontal: 20, 
      paddingVertical: 14,
      borderBottomWidth: 1, 
      borderBottomColor: colors.border,
    },
    title: { 
      fontSize: 16, 
      fontWeight: "700", 
      color: colors.foreground, 
      fontFamily: "Inter_700Bold", 
      flex: 1 
    },
    closeBtn: {
      width: 30, 
      height: 30, 
      borderRadius: 8,
      backgroundColor: colors.secondary, 
      alignItems: "center", 
      justifyContent: "center",
    },
    body: { 
      paddingHorizontal: 20, 
      paddingTop: 16,
      maxHeight: Platform.OS === "web" ? 400 : undefined,
    },
    label: { 
      fontSize: 12, 
      fontWeight: "600", 
      color: colors.mutedForeground, 
      fontFamily: "Inter_600SemiBold", 
      marginBottom: 6, 
      textTransform: "uppercase", 
      letterSpacing: 0.5 
    },
    input: {
      borderWidth: 1.5, 
      borderColor: colors.border, 
      borderRadius: colors.radius,
      paddingHorizontal: 14, 
      paddingVertical: 11, 
      fontSize: 14,
      color: colors.foreground, 
      fontFamily: "Inter_400Regular",
      backgroundColor: colors.background, 
      marginBottom: 16,
    },
    row: { 
      flexDirection: "row", 
      flexWrap: "wrap", 
      gap: 8, 
      marginBottom: 16 
    },
    chip: {
      paddingHorizontal: 14, 
      paddingVertical: 7, 
      borderRadius: 20,
      borderWidth: 1.5, 
      borderColor: colors.border, 
      backgroundColor: colors.background,
    },
    chipActive: { 
      borderColor: colors.primary, 
      backgroundColor: colors.accent 
    },
    chipText: { 
      fontSize: 13, 
      color: colors.mutedForeground, 
      fontFamily: "Inter_500Medium" 
    },
    chipTextActive: { 
      color: colors.primary, 
      fontFamily: "Inter_600SemiBold" 
    },
    submitBtn: {
      backgroundColor: colors.primary, 
      borderRadius: colors.radius,
      paddingVertical: 14, 
      alignItems: "center", 
      marginTop: 8, 
      marginHorizontal: 20, 
      marginBottom: 8,
    },
    submitBtnText: { 
      fontSize: 15, 
      fontWeight: "700", 
      color: "#ffffff", 
      fontFamily: "Inter_700Bold" 
    },
    uploadContainer: { 
      marginHorizontal: 20, 
      marginBottom: 12 
    },
    divider: { 
      flexDirection: "row", 
      alignItems: "center", 
      marginVertical: 12 
    },
    dividerLine: { 
      flex: 1, 
      height: 1, 
      backgroundColor: colors.border 
    },
    dividerText: { 
      marginHorizontal: 12, 
      fontSize: 12, 
      color: colors.mutedForeground, 
      fontFamily: "Inter_600SemiBold" 
    },
    uploadBtn: { 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: 8, 
      paddingVertical: 12, 
      borderRadius: colors.radius, 
      borderWidth: 1.5, 
      borderColor: colors.primary, 
      backgroundColor: colors.background,
      opacity: uploading ? 0.6 : 1,
    },
    uploadBtnText: { 
      fontSize: 14, 
      fontWeight: "600", 
      color: colors.primary, 
      fontFamily: "Inter_600SemiBold" 
    },
    uploadDisabled: {
      opacity: 0.5,
    },
  });

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>
                  {initial ? "Edit Student" : "Add New Student"}
                </Text>
                {initial && onDelete && (
                  <TouchableOpacity onPress={onDelete} style={{ marginRight: 12, padding: 4 }}>
                    <Feather name="trash-2" size={18} color={colors.destructive || "#dc2626"} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.body} 
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.label}>Registration Number</Text>
                <TextInput
                  style={styles.input}
                  value={regNumber}
                  onChangeText={setRegNumber}
                  placeholder="e.g. 2023CSE001"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  editable={!uploading}
                />
                
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Student full name"
                  placeholderTextColor={colors.mutedForeground}
                  editable={!uploading}
                />
                
                {!lockedContext && (
                  <>
                    <Text style={styles.label}>Branch</Text>
                    <View style={styles.row}>
                      {BRANCHES.map(b => (
                        <TouchableOpacity
                          key={b}
                          style={[styles.chip, branch === b && styles.chipActive]}
                          onPress={() => !uploading && setBranch(b)}
                        >
                          <Text style={[styles.chipText, branch === b && styles.chipTextActive]}>
                            {b}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <Text style={styles.label}>Batch</Text>
                    <View style={styles.row}>
                      {BATCHES.map(b => (
                        <TouchableOpacity
                          key={b}
                          style={[styles.chip, batch === b && styles.chipActive]}
                          onPress={() => !uploading && setBatch(b)}
                        >
                          <Text style={[styles.chipText, batch === b && styles.chipTextActive]}>
                            {b}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={[
                  styles.submitBtn, 
                  (!regNumber.trim() || !name.trim() || uploading) && { opacity: 0.5 }
                ]}
                onPress={handleSubmit}
                disabled={!regNumber.trim() || !name.trim() || uploading}
              >
                <Text style={styles.submitBtnText}>
                  {initial ? "Save Changes" : "Add Student"}
                </Text>
              </TouchableOpacity>
              
              {!initial && onBulkSubmit && !uploading && (
                <View style={styles.uploadContainer}>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR BULK ADD</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  <TouchableOpacity 
                    style={styles.uploadBtn} 
                    onPress={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Feather name="upload" size={16} color={colors.primary} />
                        <Text style={styles.uploadBtnText}>Upload Excel / CSV</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              
              {uploading && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ textAlign: "center", marginTop: 8, color: colors.mutedForeground }}>
                    Processing file...
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}