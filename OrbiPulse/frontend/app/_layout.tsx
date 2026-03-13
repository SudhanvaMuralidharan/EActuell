import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
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
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
