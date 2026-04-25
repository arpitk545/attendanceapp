import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { changePassword, deleteAccount, logout } from "@/services/operations/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSidebar } from "@/context/SidebarContext";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { open } = useSidebar();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        await logout();
        await AsyncStorage.removeItem("token");
        router.replace("/auth/login");
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            await AsyncStorage.removeItem("token");
            router.replace("/auth/login");
          }
        }
      ]);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      Alert.alert("Error", "Please fill both password fields");
      return;
    }
    setLoadingPass(true);
    const res = await changePassword(oldPassword, newPassword);
    setLoadingPass(false);
    
    if (res.success) {
      Alert.alert("Success", "Your password has been changed");
      setOldPassword("");
      setNewPassword("");
    } else {
      Alert.alert("Error", res.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your account? This will permanently erase ALL your attendance lists and data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            setLoadingDelete(true);
            const res = await deleteAccount();
            setLoadingDelete(false);
            
            if (res.success) {
              await AsyncStorage.removeItem("token");
              Alert.alert("Account Deleted", "Your account and all related data have been permanently deleted.", [
                { text: "OK", onPress: () => router.replace("/auth/login") }
              ]);
            } else {
              Alert.alert("Error", res.message || "Failed to delete account");
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: insets.top },
    header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center" },
    menuBtn: { marginRight: 16 },
    title: { fontSize: 24, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    content: { flex: 1, padding: 20 },
    section: { marginBottom: 32, backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 16 },
    label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 6 },
    inputContainer: {
      flexDirection: "row", alignItems: "center",
      borderWidth: 1.5, borderColor: colors.border, borderRadius: colors.radius,
      backgroundColor: colors.background, paddingHorizontal: 14, height: 46, marginBottom: 12
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: "100%", color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14 },
    button: {
      backgroundColor: colors.primary, height: 46, borderRadius: colors.radius,
      justifyContent: "center", alignItems: "center", marginTop: 8
    },
    buttonText: { color: "#ffffff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
    dangerZone: { borderColor: "rgba(220,38,38,0.3)" },
    dangerText: { fontSize: 14, color: "#ef4444", fontFamily: "Inter_400Regular", marginBottom: 16, lineHeight: 20 },
    dangerBtn: { backgroundColor: "rgba(220,38,38,0.1)", borderWidth: 1, borderColor: "rgba(220,38,38,0.5)" },
    dangerBtnText: { color: "#ef4444" },
    logoutBtn: {
      flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border,
      marginTop: 8
    },
    logoutText: { fontSize: 16, color: colors.foreground, fontFamily: "Inter_500Medium" }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={open}>
          <Feather name="menu" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Change Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputContainer}>
            <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor={colors.mutedForeground}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
          </View>
          
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <Feather name="shield" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor={colors.mutedForeground}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loadingPass}>
            {loadingPass ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Update Password</Text>}
          </TouchableOpacity>
        </View>

        {/* Delete Account Section */}
        <View style={[styles.section, styles.dangerZone]}>
          <Text style={[styles.sectionTitle, { color: "#ef4444" }]}>Danger Zone</Text>
          <Text style={styles.dangerText}>
            Deleting your account will permanently erase all your data, including attendance lists and records. This action cannot be undone.
          </Text>
          
          <TouchableOpacity style={[styles.button, styles.dangerBtn]} onPress={handleDeleteAccount} disabled={loadingDelete}>
            {loadingDelete ? <ActivityIndicator color="#ef4444" /> : <Text style={[styles.buttonText, styles.dangerBtnText]}>Delete Account</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
