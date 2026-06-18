import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primaryDark,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ title: 'Edit Profile' }} />
    </Stack.Navigator>
  );
}
