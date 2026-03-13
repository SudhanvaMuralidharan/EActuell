import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" backgroundColor={COLORS.background} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="valve/[id]"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: COLORS.card },
              headerTintColor: COLORS.text,
              headerTitleStyle: { fontWeight: '700' },
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
