import React, { useEffect, useState } from "react";
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
// Import AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateRestaurant, getRestaurantProfile, logoutRestaurant } from "../../services/restaurantServices";

export default function ProfileScreen() {
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getRestaurantProfile();
        // --- CHANGE: Check for a successful response ---
        if (response.success) {
          const data = response.data;
          setRestaurantName(data.restaurantName || "");
          setAddress(data.address || "");
          setPhone(data.phone || "");
        } else {
          // --- CHANGE: Show user-friendly error from the service ---
          Alert.alert("Error", response.message || "Could not load profile");
        }
      } catch (error) {
        console.error("Failed to fetch restaurant:", error);
        Alert.alert("Error", "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdate = async () => {
    if (!restaurantName.trim() || !address.trim() || !phone.trim()) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setIsSaving(true);
      const response = await updateRestaurant(restaurantName, address, phone);
      // --- CHANGE: Check for success and show appropriate message ---
      if(response.success){
        Alert.alert("Success", response.data.message || "Profile updated successfully");
      } else {
        Alert.alert("Error", response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      Alert.alert("Error", "An unexpected error occurred during update.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- CHANGE: Updated logout handler ---
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          // Use async/await for cleaner logic
          onPress: async () => {
            try {
              await logoutRestaurant();
              // *** CRITICAL: Remove the token from storage ***
              await AsyncStorage.removeItem("token");
              router.replace("/login");
              console.log("User logged out and token removed");
            } catch (error) {
              console.error("Logout failed:", error);
              Alert.alert("Error", "Failed to log out");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.centeredContainer}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.avatar}>
              <Ionicons name="storefront-outline" size={50} color="#4F46E5" />
            </View>
            <Text style={styles.headerTitle}>Restaurant Profile</Text>
            <Text style={styles.headerSubtitle}>
              Update your restaurant's information
            </Text>
          </View>

          {/* Profile Form */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Restaurant Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="business-outline"
                size={22}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Your Restaurant LLC"
                value={restaurantName}
                onChangeText={setRestaurantName}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={22}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="123 Foodie Lane"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={22}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="(123) 456-7890"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Update Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isSaving}
              style={[styles.button, isSaving && styles.buttonDisabled]}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Styling (No changes needed here) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    marginLeft: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutButtonText: {
    marginLeft: 10,
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 18,
  },
});
