import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, useColorScheme, Dimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { forgotPassword } from "@/services/operations/auth";
import { ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  withRepeat, 
  withTiming, 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence,
  Easing,
  withSpring
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Animated Input Component
const AnimatedInput = ({ label, icon, placeholder, value, onChangeText, colors, isDark }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);
  
  const animatedBorderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: isFocused ? '#4f46e5' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02);
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.inputInnerContainer}>
        <Feather name={icon} size={18} color={isFocused ? '#4f46e5' : colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </Animated.View>
  );
};

// Animated Button Component
const AnimatedButton = ({ onPress, text, loading }: any) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={[animatedStyle, { width: '100%' }]}>
      <Pressable 
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut} 
        onPress={onPress}
        disabled={loading}
      >
        <LinearGradient
          colors={['#4f46e5', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>{text}</Text>
              <Feather name="mail" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// Animated Back Button
const AnimatedBackButton = ({ onPress, colors }: any) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={styles.backBtn}>
        <Feather name="arrow-left" size={24} color={colors.foreground} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Info Card Component
const InfoCard = ({ colors, isDark }: any) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View style={[styles.infoCard, animatedStyle, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)' }]}>
      <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.infoCardBlur}>
        <View style={styles.infoIconContainer}>
          <Feather name="info" size={20} color="#4f46e5" />
        </View>
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          We'll send you a secure link to reset your password
        </Text>
      </BlurView>
    </Animated.View>
  );
};

export function ForgotPassword() {
  const colors = useColors();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Background Blobs Animation
  const blob1Scale = useSharedValue(1);
  const blob2Scale = useSharedValue(1);
  const blob2TranslateX = useSharedValue(0);

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    blob2Scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    blob2TranslateX.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ scale: blob1Scale.value }]
  }));

  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ scale: blob2Scale.value }, { translateX: blob2TranslateX.value }]
  }));

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      Alert.alert(
        "Reset Link Sent", 
        "Instructions to reset your password have been sent to your email",
        [{ text: "OK", onPress: () => router.push("/auth/login") }]
      );
    } else {
      Alert.alert("Error", res.message || "Failed to send reset link");
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: isDark ? "#020617" : "#f8fafc" }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* Dynamic Animated Gradient Blobs */}
      <Animated.View style={[styles.blob1, animatedBlob1]}>
        <LinearGradient
          colors={isDark ? ['#4338ca', '#312e81'] : ['#818cf8', '#e0e7ff']}
          style={styles.blobGradient}
        />
      </Animated.View>
      
      <Animated.View style={[styles.blob2, animatedBlob2]}>
        <LinearGradient
          colors={isDark ? ['#6b21a8', '#4c1d95'] : ['#c084fc', '#f3e8ff']}
          style={styles.blobGradient}
        />
      </Animated.View>

      {/* Glass Blur Overlay */}
      <BlurView intensity={isDark ? 100 : 80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <AnimatedBackButton onPress={() => router.back()} colors={colors} />

        <Animated.View entering={FadeInUp.delay(200).springify().damping(14)} style={styles.formContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={isDark ? ['rgba(79, 70, 229, 0.4)', 'rgba(124, 58, 237, 0.1)'] : ['rgba(79, 70, 229, 0.2)', 'rgba(255, 255, 255, 1)']}
                style={[styles.iconGlow, { borderColor: isDark ? 'rgba(79, 70, 229, 0.5)' : '#fff' }]}
              >
                <Feather name="key" size={32} color="#4f46e5" />
              </LinearGradient>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          {/* Info Card */}
          <InfoCard colors={colors} isDark={isDark} />

          {/* Form Section */}
          <View style={styles.form}>
            <AnimatedInput
              label="Email Address"
              icon="mail"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              colors={colors}
              isDark={isDark}
            />

            <AnimatedButton 
              onPress={handleReset} 
              text="Send Reset Link" 
              loading={loading}
            />
          </View>

          {/* Footer Helper Text */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    opacity: 0.8,
  },
  blob2: {
    position: 'absolute',
    top: height * 0.35,
    right: -width * 0.3,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    opacity: 0.7,
  },
  blobGradient: {
    flex: 1,
    borderRadius: 999,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGlow: {
    width: 70,
    height: 70,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    transform: [{ rotate: '10deg' }],
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoCardBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    gap: 24,
    marginBottom: 24,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
  },
  inputInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: 8,
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerLink: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});