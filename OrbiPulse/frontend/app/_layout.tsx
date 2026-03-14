import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ValveProvider } from '../context/ValveContext';
import { LanguageProvider } from '../context/LanguageContext';

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
        <Stack.Screen name="index" />
        
        {!isAuthenticated && (
          <Stack.Screen name="auth/login" />
        )}
        
        {isAuthenticated && (
          <Stack.Screen name="auth/profile-setup" />
        )}
        
        {isAuthenticated && (
          <Stack.Screen name="(tabs)" />
        )}
        
        {isAuthenticated && (
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
        )}
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ValveProvider>
            <RootContent />
          </ValveProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
