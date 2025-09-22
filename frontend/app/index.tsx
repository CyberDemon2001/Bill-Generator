import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const { height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          router.replace("/main");
        }
      } catch (error) {
        console.error("Error reading token:", error);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  if (loading) {
    // Show a loader while checking token
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* Top Purple Curved Background */}
      <View style={styles.topHalf} />

      {/* Bottom White Content Area */}
      <View style={styles.bottomHalf}>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Welcome to ThinkNBill</Text>
          <Text style={styles.subtitle}>
            Manage your restaurant effortlessly with our smart system.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={() => router.push("/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.signupButton]}
              onPress={() => router.push("/signup")}
              activeOpacity={0.8}
            >
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Logo overlapping center */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/logo_final-removebg-preview.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", 
  },
  topHalf: {
    height: height * 0.55, 
    backgroundColor: "#4F46E5",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  bottomHalf: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  logoWrapper: {
    position: "absolute",
    top: height * 0.55 - 80,
    alignSelf: "center",
    zIndex: 5,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  logo: {
    width: 170,
    height: 170,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  buttonGroup: {
    width: "100%",
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  loginButton: {
    backgroundColor: "#4F46E5",
  },
  signupButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#4F46E5",
    elevation: 0,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  signupText: {
    color: "#4F46E5",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
