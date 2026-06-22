import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmStackParamList } from '../types';
import FarmListScreen from '../screens/FarmListScreen';
import AddEditFarmScreen from '../screens/AddEditFarmScreen';
import FarmDetailScreen from '../screens/FarmDetailScreen';
import CropListScreen from '../screens/CropListScreen';
import CropFormScreen from '../screens/CropFormScreen';
import CropDetailScreen from '../screens/CropDetailScreen';

const Stack = createNativeStackNavigator<FarmStackParamList>();

export default function FarmStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#14B8A6',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#14B8A6', fontWeight: '600' },
      }}
    >
      <Stack.Screen name="FarmList" component={FarmListScreen} options={{ title: 'My Farms' }} />
      <Stack.Screen name="AddEditFarm" component={AddEditFarmScreen} options={({ route }: any) => ({ title: route.params?.farmId ? 'Edit Farm' : 'Add Farm' })} />
      <Stack.Screen name="FarmDetail" component={FarmDetailScreen} options={{ title: 'Farm Details' }} />
      <Stack.Screen name="CropList" component={CropListScreen} options={{ title: 'Crops' }} />
      <Stack.Screen name="CropForm" component={CropFormScreen} options={({ route }: any) => ({ title: route.params?.cropId ? 'Edit Crop' : 'Add Crop' })} />
      <Stack.Screen name="CropDetail" component={CropDetailScreen} options={{ title: 'Crop Details' }} />
    </Stack.Navigator>
  );
}
