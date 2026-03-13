import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#050D1A" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="valve/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#0B1829' },
            headerTintColor: '#E8F0FE',
            headerTitleStyle: { fontWeight: '700' },
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
