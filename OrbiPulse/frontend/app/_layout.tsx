import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <View style={styles.root}>
          <StatusBar style="auto" backgroundColor={COLORS.background} />
          <Stack screenOptions={{ headerShown: false }}>
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
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
