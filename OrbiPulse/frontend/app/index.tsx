import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('[INDEX] Auth State:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // If authenticated but no name, go to profile setup
  if (!user?.name) {
    return <Redirect href="/auth/profile-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
