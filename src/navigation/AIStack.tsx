import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AIStackParamList } from '../types';
import AIChatScreen from '../screens/AIChatScreen';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AIChat" component={AIChatScreen} />
    </Stack.Navigator>
  );
}
