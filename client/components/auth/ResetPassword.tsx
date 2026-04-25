import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { resetPassword } from "@/services/operations/auth";

export function ResetPassword() {
  const colors = useColors();
  const router = useRouter();
  const { token } = useLocalSearchParams();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token) {
      Alert.alert("Error", "Invalid or missing reset token");
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    setLoading(true);
    const res = await resetPassword(token as string, newPassword);
    setLoading(false);
    
    if (res.success) {
      Alert.alert("Success", "Your password has been successfully reset. You can now login.", [
        { text: "Go to Login", onPress: () => router.push("/auth/login") }
      ]);
    } else {
      Alert.alert("Error", res.message || "Failed to reset password");
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: 24, justifyContent: "center" },
    backBtn: { alignSelf: "flex-start", marginBottom: 24, padding: 8, marginLeft: -8 },
    header: { marginBottom: 32 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 },
    subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 22 },
    form: { gap: 16 },
    label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 6 },
    inputContainer: {
      flexDirection: "row", alignItems: "center",
      borderWidth: 1.5, borderColor: colors.border, borderRadius: colors.radius,
      backgroundColor: colors.card, paddingHorizontal: 14, height: 50,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: "100%", color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 15 },
    button: {
      backgroundColor: colors.primary, height: 50, borderRadius: colors.radius,
      justifyContent: "center", alignItems: "center", marginTop: 8
    },
    buttonText: { color: "#ffffff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/auth/login")}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>Please enter your new password below.</Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={colors.mutedForeground}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
          </View>
          
          <View>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={colors.mutedForeground}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
