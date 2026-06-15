import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: true,
          headerTitle: 'Sign In',
          headerBackTitle: 'Back',
          headerTintColor: '#2E7D32',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#1B5E20', fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create Account',
          headerBackTitle: 'Back',
          headerTintColor: '#2E7D32',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#1B5E20', fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          headerTitle: 'Reset Password',
          headerBackTitle: 'Back',
          headerTintColor: '#2E7D32',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#1B5E20', fontWeight: '600' },
        }}
      />
    </Stack.Navigator>
  );
}
