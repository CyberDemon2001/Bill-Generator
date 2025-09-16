import React, { useEffect, useState } from "react";
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { updateRestaurant, getRestaurantProfile, logoutRestaurant } from "../../services/restaurantServices";

export default function ProfileScreen() {
  // --- State Management (Logic is unchanged) ---
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Set to true to show loader on initial mount
  const [isSaving, setIsSaving] = useState(false);

  // --- Data Fetching on Mount (Logic is unchanged) ---
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getRestaurantProfile();
        const data = response.restaurant;
        setRestaurantName(data.restaurantName || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
      } catch (error) {
        console.error("Failed to fetch restaurant:", error);
        Alert.alert("Error", "Could not load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // --- Update Handler (Logic is unchanged) ---
  const handleUpdate = async () => {
    if (!restaurantName.trim() || !address.trim() || !phone.trim() ) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setIsSaving(true);
      const response = await updateRestaurant(restaurantName, address, phone);
      Alert.alert("Success", response.message || "Profile updated successfully");
    } catch (error: any) {
      console.error("Update failed:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Logout Handler (New) ---
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
          onPress: () => {
            logoutRestaurant()
              .then(() => {
                router.replace("/login");
                console.log("User logged out");
              })
              .catch((error) => {
                console.error("Logout failed:", error);
                Alert.alert("Error", "Failed to log out");
              });
          },
        },
      ]
    );
  };

  // --- Loading State UI ---
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // --- Main Component UI ---
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

// --- Styling ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Use a light, neutral background color
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
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E7FF', // A light, welcoming color
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
    backgroundColor: '#4F46E5', // A vibrant, modern indigo
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
    backgroundColor: '#FEE2E2', // A light red background
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 20, // Add some space above the logout button
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutButtonText: {
    marginLeft: 10,
    color: '#EF4444', // A strong red color for the text
    fontWeight: '600',
    fontSize: 18,
  },
});
