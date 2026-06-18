import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FinanceStackParamList } from '../types';
import FinancialDashboardScreen from '../screens/FinancialDashboardScreen';
import ExpenseListScreen from '../screens/ExpenseListScreen';
import ExpenseFormScreen from '../screens/ExpenseFormScreen';
import IncomeListScreen from '../screens/IncomeListScreen';
import IncomeFormScreen from '../screens/IncomeFormScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<FinanceStackParamList>();

export default function FinanceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primaryDark,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="FinanceDashboard" component={FinancialDashboardScreen} options={{ title: 'Financial Summary' }} />
      <Stack.Screen name="ExpenseList" component={ExpenseListScreen} options={{ title: 'Expenses' }} />
      <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={({ route }: any) => ({ title: route.params?.expenseId ? 'Edit Expense' : 'Add Expense' })} />
      <Stack.Screen name="IncomeList" component={IncomeListScreen} options={{ title: 'Income Records' }} />
      <Stack.Screen name="IncomeForm" component={IncomeFormScreen} options={({ route }: any) => ({ title: route.params?.incomeId ? 'Edit Income' : 'Add Income' })} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ title: 'Transaction History' }} />
    </Stack.Navigator>
  );
}
