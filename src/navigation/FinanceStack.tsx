import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FinanceStackParamList } from '../types';
import FinancialDashboardScreen from '../screens/FinancialDashboardScreen';
import ExpenseListScreen from '../screens/ExpenseListScreen';
import ExpenseFormScreen from '../screens/ExpenseFormScreen';
import IncomeListScreen from '../screens/IncomeListScreen';
import IncomeFormScreen from '../screens/IncomeFormScreen';

const Stack = createNativeStackNavigator<FinanceStackParamList>();

export default function FinanceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#2E7D32',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#1B5E20', fontWeight: '600' },
      }}
    >
      <Stack.Screen name="FinanceDashboard" component={FinancialDashboardScreen} options={{ title: 'Financial Summary' }} />
      <Stack.Screen name="ExpenseList" component={ExpenseListScreen} options={{ title: 'Expenses' }} />
      <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={({ route }: any) => ({ title: route.params?.expenseId ? 'Edit Expense' : 'Add Expense' })} />
      <Stack.Screen name="IncomeList" component={IncomeListScreen} options={{ title: 'Income Records' }} />
      <Stack.Screen name="IncomeForm" component={IncomeFormScreen} options={({ route }: any) => ({ title: route.params?.incomeId ? 'Edit Income' : 'Add Income' })} />
    </Stack.Navigator>
  );
}
