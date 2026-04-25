import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { sendOtp, signup } from "@/services/operations/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

export function Signup() {
  const colors = useColors();
  const router = useRouter();

  const [step, setStep] = useState<"details" | "otp" | "password">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load timer state on component mount
  useEffect(() => {
    loadTimerState();

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  // Save timer state to storage whenever it changes
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      saveTimerState();
    }
  }, [timer, step]);

  const loadTimerState = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('otp_email');
      const savedTimestamp = await AsyncStorage.getItem('otp_timestamp');
      const savedStep = await AsyncStorage.getItem('otp_step');

      if (savedEmail === email && savedTimestamp && savedStep === "otp") {
        const elapsedTime = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
        const remainingTime = Math.max(0, 300 - elapsedTime); // 5 minutes = 300 seconds

        if (remainingTime > 0) {
          setTimer(remainingTime);
          setCanResend(false);
          startTimer(remainingTime);
        } else {
          setTimer(0);
          setCanResend(true);
          clearTimerStorage();
        }
      } else {
        setTimer(0);
        setCanResend(true);
      }
    } catch (error) {
      console.error("Error loading timer state:", error);
    }
  };

  const saveTimerState = async () => {
    try {
      if (step === "otp" && timer > 0) {
        const timestamp = await AsyncStorage.getItem('otp_timestamp');
        if (!timestamp) {
          await AsyncStorage.setItem('otp_email', email);
          await AsyncStorage.setItem('otp_timestamp', Date.now().toString());
          await AsyncStorage.setItem('otp_step', step);
        }
      }
    } catch (error) {
      console.error("Error saving timer state:", error);
    }
  };

  const clearTimerStorage = async () => {
    try {
      await AsyncStorage.removeItem('otp_email');
      await AsyncStorage.removeItem('otp_timestamp');
      await AsyncStorage.removeItem('otp_step');
    } catch (error) {
      console.error("Error clearing timer storage:", error);
    }
  };

  const startTimer = (initialSeconds: number = 300) => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    timerInterval.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
          }
          setCanResend(true);
          clearTimerStorage();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyEmail = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all details");
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(email);
      if (res.success) {
        setStep("otp");
        setTimer(300); // 5 minutes
        setCanResend(false);
        startTimer(300);

        // Save initial timer state
        await AsyncStorage.setItem('otp_email', email);
        await AsyncStorage.setItem('otp_timestamp', Date.now().toString());
        await AsyncStorage.setItem('otp_step', "otp");
      } else {
        Alert.alert("Error", res.message || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Could not send OTP properly");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) {
      Alert.alert("Please wait", `You can resend OTP after ${formatTime(timer)}`);
      return;
    }

    try {
      const res = await sendOtp(email);
      if (res.success) {
        setTimer(300);
        setCanResend(false);
        startTimer(300);

        // Update timer state
        await AsyncStorage.setItem('otp_timestamp', Date.now().toString());
        Alert.alert("Success", "OTP resent successfully");
      } else {
        Alert.alert("Error", res.message || "Failed to resend OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Could not resend OTP properly");
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      Alert.alert("Error", "Please enter a valid OTP");
      return;
    }
    // Clear timer when moving to next step
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    clearTimerStorage();
    setStep("password");
  };

  const handleCreateAccount = async () => {
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup({
        fullName,
        email,
        password,
        confirmPassword,
        otp
      });
      if (res.success) {
        // Clear any stored timer data on success
        clearTimerStorage();
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
        Alert.alert("Success", "Your account has been created!", [
          { text: "OK", onPress: () => router.push("/auth/login") }
        ]);
      } else {
        Alert.alert("Signup Failed", res.message || "Failed to create account");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong during signup");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: 24, justifyContent: "center" },
    header: { marginBottom: 32 },
    title: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 },
    subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
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
    resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
      gap: 8
    },
    resendText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground
    },
    resendLink: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary
    },
    timerText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary
    },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
    footerText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.primary, marginLeft: 4 },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and manage attendance seamlessly</Text>
        </View>

        <View style={styles.form}>
          {step === "details" && (
            <>
              <View>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.mutedForeground}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>
              <View>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.mutedForeground}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleVerifyEmail} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Email</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <View>
                <Text style={styles.label}>Enter OTP</Text>
                <View style={styles.inputContainer}>
                  <Feather name="key" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP sent to email"
                    placeholderTextColor={colors.mutedForeground}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
                <Text style={styles.buttonText}>Verify OTP</Text>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <>
                    <Text style={styles.resendText}>Resend OTP in</Text>
                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                  </>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {step === "password" && (
            <>
              <View>
                <Text style={styles.label}>Enter Password</Text>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a strong password"
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>
              <View>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.mutedForeground}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleCreateAccount} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Signup</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}