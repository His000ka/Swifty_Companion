import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Swifty Companion' }} />
        <Stack.Screen name="profile/[login]" options={{ title: 'Profil' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}