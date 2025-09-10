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
} from "react-native";

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("../assets/images/logo_final-removebg-preview.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title / Tagline */}
        <Text style={styles.title}>Welcome to FoodX</Text>
        <Text style={styles.subtitle}>
          Manage your restaurant effortlessly with our smart system.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3B82F6", // blue background
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#E5E7EB", // light gray
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    width: "100%",
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#fff",
  },
  signupButton: {
    backgroundColor: "#1E40AF", // darker blue
  },
  loginText: {
    color: "#3B82F6",
    fontSize: 18,
    fontWeight: "600",
  },
  signupText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
