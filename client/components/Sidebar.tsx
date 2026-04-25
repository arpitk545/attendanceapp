import { Feather } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../services/operations/auth";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSidebar } from "../context/SidebarContext";
import { useColors } from "../hooks/useColors";
import { useApp } from "../context/AppContext";

interface NavItem {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  tab: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: "home", route: "/(tabs)", tab: "index" },
  { label: "Attendance Lists", icon: "check-square", route: "/(tabs)/attendance", tab: "attendance" },
  { label: "Today's Attendance", icon: "file-text", route: "/(tabs)/sheets", tab: "sheets" },
  { label: "All Report", icon: "file-text", route: "/(tabs)/history", tab: "history" },
];

export function Sidebar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isOpen, close, translateX, overlayOpacity, sidebarWidth } = useSidebar();
  const router = useRouter();
  const segments = useSegments();
  const { students } = useApp();
  const [userName, setUserName] = useState("Instructor");

  useEffect(() => {
    const fetchUser = async () => {
      const name = await AsyncStorage.getItem("userName");
      if (name) setUserName(name);
    };
    fetchUser();
  }, []);

  const currentTab = segments[segments.length - 1] || "index";

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        close();
        logout().then(() => {
          AsyncStorage.removeItem("token").then(() => {
            window.location.href = "/";
          });
        });
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel", onPress: () => close() },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            close();
            await logout();
            await AsyncStorage.removeItem("token");
            router.replace("/");
          }
        }
      ]);
    }
  };

  const styles = StyleSheet.create({
    overlayContainer: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
    },
    overlay: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sidebar: {
      position: "absolute", top: 0, left: 0, bottom: 0,
      width: sidebarWidth,
      backgroundColor: colors.sidebar,
      zIndex: 101,
    },
    profile: {
      paddingTop: topPad + 16,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
    },
    avatarWrap: {
      width: 70, height: 70, borderRadius: 35,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center",
      marginBottom: 12,
      borderWidth: 3, borderColor: "rgba(255,255,255,0.15)",
    },
    avatarText: {
      fontSize: 28, fontWeight: "700", color: "#ffffff", fontFamily: "Inter_700Bold",
    },
    profileName: {
      fontSize: 16, fontWeight: "700", color: "#ffffff",
      fontFamily: "Inter_700Bold", marginBottom: 2,
    },
    profileRole: {
      fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular",
    },
    statsRow: {
      flexDirection: "row", gap: 8, marginTop: 14, width: "100%",
    },
    statBox: {
      flex: 1, backgroundColor: "rgba(255,255,255,0.07)",
      borderRadius: 8, padding: 9, alignItems: "center",
    },
    statNumber: { fontSize: 16, fontWeight: "700", color: "#ffffff", fontFamily: "Inter_700Bold" },
    statLabel: { fontSize: 10, color: "#94a3b8", fontFamily: "Inter_400Regular", marginTop: 2 },
    nav: { paddingHorizontal: 12, paddingTop: 16, flex: 1 },
    sectionLabel: {
      fontSize: 10, letterSpacing: 1.2, color: "#94a3b8",
      fontFamily: "Inter_600SemiBold", marginBottom: 6, marginLeft: 8,
      textTransform: "uppercase",
    },
    navItem: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10, marginBottom: 2,
    },
    navItemActive: { backgroundColor: colors.sidebarActive },
    navLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#94a3b8" },
    navLabelActive: { color: "#ffffff", fontFamily: "Inter_600SemiBold" },
    footer: {
      paddingHorizontal: 12,
      paddingBottom: bottomPad + 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.08)",
      gap: 4,
    },
    footerBtn: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
    },
    footerBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#94a3b8" },
    logoutBtn: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
      backgroundColor: "rgba(220,38,38,0.12)",
    },
    logoutText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#f87171" },
  });

  if (!isOpen) return null;

  return (
    <View style={[styles.overlayContainer, { pointerEvents: "box-none" }]}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={close} />
      </Animated.View>

      <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]}>
        <View style={styles.profile}>
          <View style={[styles.avatarWrap, { backgroundColor: "transparent", borderWidth: 0 }]}>
            <Image 
              source={require("../assets/images/icon.png")} 
              style={{ width: "100%", height: "100%", borderRadius: 35 }} 
              resizeMode="cover" 
            />
          </View>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileRole}>Attendance Manager</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{students.length}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
          </View>
        </View>

        <View style={styles.nav}>
          <Text style={styles.sectionLabel}>Navigation</Text>
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.tab || (item.tab === "index" && currentTab === "(tabs)");
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => { router.push(item.route as any); close(); }}
                activeOpacity={0.7}
              >
                <Feather name={item.icon} size={18} color={isActive ? "#ffffff" : "#94a3b8"} />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                {isActive && <View style={{ marginLeft: "auto" }}><Feather name="chevron-right" size={14} color="#ffffff" /></View>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn} onPress={() => { router.push("/(tabs)/settings"); close(); }} activeOpacity={0.7}>
            <Feather name="settings" size={18} color="#94a3b8" />
            <Text style={styles.footerBtnText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Feather name="log-out" size={18} color="#f87171" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
