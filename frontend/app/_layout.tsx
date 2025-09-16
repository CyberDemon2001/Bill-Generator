import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      
{/* Index screen: root screen, no back button */}
      <Stack.Screen
        name="index"
        options={{
          headerBackVisible: false,
          headerTitle: "ThinkNBill",
        }}
      />

      {/* Login screen: hide back button & header */}
      <Stack.Screen
        name="login"
        options={{
          headerBackVisible: false,
          headerTitle: "Login",
        }}
      />

      {/* Signup screen: hide back button & header */}
      <Stack.Screen
        name="signup"
        options={{
          headerBackVisible: false,
          headerTitle: "Sign Up",
        }}
      />


      {/* Main screen: normal back button */}
      <Stack.Screen
        name="main"
        options={{
          headerBackVisible: false,
          headerTitle: "Main",
        }}
      />
    </Stack>
  );
}
