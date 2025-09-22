import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AuthCheck() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (isMounted) {
          if (token) {
            router.replace("/main");
          } else {
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Error reading token:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkLogin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
