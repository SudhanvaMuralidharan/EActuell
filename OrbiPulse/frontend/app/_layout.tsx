import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ValveProvider } from '../context/ValveContext';

function RootContent() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('[LAYOUT] Auth State:', { isAuthenticated, isLoading });
  
  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
          </>
        ) : (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/profile-setup" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="valve/[id]"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: colors.card },
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '700' },
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ValveProvider>
          <RootContent />
        </ValveProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
