import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet, Dimensions, Pressable, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
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

// Floating Card Component for 3D/layered feel
const FloatingCard = ({ icon, text, subtext, delay, style, colors, isDark }: any) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2500 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View style={[styles.floatingCardContainer, style, animatedStyle, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
      <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.floatingCardBlur}>
        <View style={styles.floatingCardIconContainer}>
          <Feather name={icon} size={20} color="#4f46e5" />
        </View>
        <View>
          <Text style={[styles.floatingCardText, { color: colors.foreground }]}>{text}</Text>
          <Text style={[styles.floatingCardSubtext, { color: colors.mutedForeground }]}>{subtext}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
};

// Interactive Animated Button
const AnimatedButton = ({ onPress, text }: any) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
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
      >
        <LinearGradient
          colors={['#4f46e5', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>{text}</Text>
          <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Background Blobs Animation for dynamic gradient background
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

    AsyncStorage.getItem("token").then(token => {
      setHasToken(!!token);
      setLoading(false);
    });
  }, []);

  const animatedBlob1 = useAnimatedStyle(() => ({
    transform: [{ scale: blob1Scale.value }]
  }));

  const animatedBlob2 = useAnimatedStyle(() => ({
    transform: [{ scale: blob2Scale.value }, { translateX: blob2TranslateX.value }]
  }));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (hasToken) return <Redirect href="/(tabs)" />;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#020617" : "#f8fafc" }]}>
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

      {/* Massive Glass Blur over Blobs for premium glowing mesh effect */}
      <BlurView intensity={isDark ? 100 : 80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />

      <View style={styles.contentContainer}>
        
        {/* Floating Widgets & Visual Hierarchy */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(12)} style={styles.heroSection}>
          <FloatingCard 
            icon="bar-chart-2" 
            text="98.4%" 
            subtext="Avg. Attendance" 
            delay={0}
            colors={colors}
            isDark={isDark}
            style={{ top: '15%', left: '0%' }} 
          />
          <FloatingCard 
            icon="users" 
            text="150+" 
            subtext="Live Students" 
            delay={800}
            colors={colors}
            isDark={isDark}
            style={{ top: '55%', right: '0%' }} 
          />
          
          <View style={styles.centralIconContainer}>
            <LinearGradient
              colors={isDark ? ['rgba(79, 70, 229, 0.4)', 'rgba(124, 58, 237, 0.1)'] : ['rgba(79, 70, 229, 0.2)', 'rgba(255, 255, 255, 1)']}
              style={[styles.centralIconGlow, { borderColor: isDark ? 'rgba(79, 70, 229, 0.5)' : '#fff' }]}
            >
              <Feather name="layers" size={42} color="#4f46e5" />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Text & Call To Actions */}
        <Animated.View entering={FadeInUp.delay(300).springify().damping(14)} style={styles.bottomSection}>
          <View style={styles.textWrapper}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Next-Gen Platform</Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Manage Classes{"\n"}
              <Text style={{ color: '#4f46e5' }}>Beautifully.</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Experience fluid attendance tracking with real-time analytics and a premium modern interface.
            </Text>
          </View>

          <View style={styles.actionContainer}>
            <AnimatedButton 
              text="Get Started" 
              onPress={() => router.push("/auth/login")} 
            />

            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
                New to the platform? 
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text style={styles.registerLink}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: height * 0.12,
    paddingBottom: height * 0.08,
  },
  heroSection: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  centralIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  centralIconGlow: {
    width: 100,
    height: 100,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    transform: [{ rotate: '10deg' }],
  },
  floatingCardContainer: {
    position: 'absolute',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  floatingCardBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingRight: 20,
    gap: 14,
  },
  floatingCardIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCardText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  floatingCardSubtext: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  bottomSection: {
    width: '100%',
    gap: 36,
  },
  textWrapper: {
    gap: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
    marginBottom: 4,
  },
  badgeText: {
    color: '#4f46e5',
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  title: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    lineHeight: 56,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    paddingRight: 20,
  },
  actionContainer: {
    width: "100%",
    gap: 24,
  },
  loginButton: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  registerLink: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#4f46e5",
  },
});
