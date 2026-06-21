import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AIStackParamList } from '../types';
import AIHubScreen from '../screens/AIHubScreen';
import AIChatScreen from '../screens/AIChatScreen';
import DiseaseScannerScreen from '../screens/DiseaseScannerScreen';
import CropRecommendationScreen from '../screens/CropRecommendationScreen';
import IrrigationAdvisorScreen from '../screens/IrrigationAdvisorScreen';
import FertilizerAdvisorScreen from '../screens/FertilizerAdvisorScreen';
import SchemesAssistantScreen from '../screens/SchemesAssistantScreen';
import SmartAlertsScreen from '../screens/SmartAlertsScreen';
import MarketAdvisorScreen from '../screens/MarketAdvisorScreen';

const Stack = createNativeStackNavigator<AIStackParamList>();

export default function AIStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AIHub" component={AIHubScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="DiseaseScanner" component={DiseaseScannerScreen} />
      <Stack.Screen name="CropRecommendation" component={CropRecommendationScreen} />
      <Stack.Screen name="IrrigationAdvisor" component={IrrigationAdvisorScreen} />
      <Stack.Screen name="FertilizerAdvisor" component={FertilizerAdvisorScreen} />
      <Stack.Screen name="SchemesAssistant" component={SchemesAssistantScreen} />
      <Stack.Screen name="SmartAlerts" component={SmartAlertsScreen} />
      <Stack.Screen name="MarketAdvisor" component={MarketAdvisorScreen} />
    </Stack.Navigator>
  );
}
