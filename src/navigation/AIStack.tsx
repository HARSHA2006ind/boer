import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AIStackParamList } from '../types';
import AIChatScreen from '../screens/AIChatScreen';
import DiseaseScannerScreen from '../screens/DiseaseScannerScreen';
import CropRecommendationScreen from '../screens/CropRecommendationScreen';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="DiseaseScanner" component={DiseaseScannerScreen} />
      <Stack.Screen name="CropRecommendation" component={CropRecommendationScreen} />
    </Stack.Navigator>
  );
}
