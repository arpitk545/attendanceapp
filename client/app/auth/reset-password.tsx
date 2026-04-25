import { ResetPassword } from "@/components/auth/ResetPassword";
import { Stack } from "expo-router";
import React from "react";

export default function ResetPasswordScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ResetPassword />
    </>
  );
}
