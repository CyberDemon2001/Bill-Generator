import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";

const { height } = Dimensions.get("window");

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6D28D9" />

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
    backgroundColor: "#fff", // White background for the bottom part
  },
  topHalf: {
    height: height * 0.55, // Takes up 55% of the screen height
    backgroundColor: "#4F46E5", // A richer purple
    borderBottomLeftRadius: 80, // Creates the curve
    borderBottomRightRadius: 80, // Creates the curve
  },
  bottomHalf: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "transparent", // Keep transparent to see the curve
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80, // Pushes content below the logo's space
  },
  logoWrapper: {
    position: "absolute",
    // Position it right at the transition point of the two halves
    top: height * 0.55 - 80, // (55% of screen height) - (half of logo wrapper size)
    alignSelf: "center", // Center horizontally
    zIndex: 5,
    width: 160,
    height: 160,
    borderRadius: 80, // Perfect circle
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    // Softer shadow for a premium feel
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
    fontWeight: "bold", // Bolder for more impact
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563", // Slightly darker gray for better contrast
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 10,
    lineHeight: 24, // Improved readability
  },
  buttonGroup: {
    width: "100%",
  },
  button: {
    height: 52,
    borderRadius: 14, // Slightly more rounded
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    // Add shadow to buttons
    elevation: 4,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  loginButton: {
    backgroundColor: "#4F46E5", // Match the top background
  },
  // Secondary button style for "Sign Up" to create a clear visual hierarchy
  signupButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#4F46E5",
    elevation: 0, // No shadow for the secondary button
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  signupText: {
    color: "#4F46E5", // Text color matches the border
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WelcomeScreen;