import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EcosystemTabParamList, EcosystemStackParamList } from '../types';
import GovernmentSchemesScreen from '../screens/ecosystem/GovernmentSchemesScreen';
import CommunityFeedScreen from '../screens/ecosystem/CommunityFeedScreen';
import KnowledgeCenterScreen from '../screens/ecosystem/KnowledgeCenterScreen';
import RegionalAlertsScreen from '../screens/ecosystem/RegionalAlertsScreen';
import CropPriceDetailScreen from '../screens/ecosystem/CropPriceDetailScreen';
import SchemeDetailScreen from '../screens/ecosystem/SchemeDetailScreen';
import PostDetailScreen from '../screens/ecosystem/PostDetailScreen';
import CreatePostScreen from '../screens/ecosystem/CreatePostScreen';
import ArticleDetailScreen from '../screens/ecosystem/ArticleDetailScreen';
import VideoLearningHubScreen from '../screens/ecosystem/VideoLearningHubScreen';
import MarketplaceScreen from '../screens/ecosystem/MarketplaceScreen';
import FarmerDirectoryScreen from '../screens/ecosystem/FarmerDirectoryScreen';
import { colors, radius, spacing, shadows } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

const Tab = createMaterialTopTabNavigator<EcosystemTabParamList>();
const Stack = createNativeStackNavigator<EcosystemStackParamList>();

const SUB_TABS = [
  { key: 'SchemesTab', label: 'schemes', icon: 'shield-checkmark' as const },
  { key: 'CommunityTab', label: 'community', icon: 'people' as const },
  { key: 'LearnTab', label: 'learn', icon: 'book' as const },
  { key: 'AlertsTab', label: 'alerts', icon: 'warning' as const },
];

function CustomTabBar({ state, descriptors, position }: any) {
  const { t } = useLanguage();
  return (
    <View style={tabStyles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tabStyles.scroll}>
        {state.routes.map((route: any, i: number) => {
          const focused = state.index === i;
          const item = SUB_TABS[i];
          return (
            <TouchableOpacity key={route.key} onPress={() => descriptors[route.key].navigation.navigate(route.name)}
              style={[tabStyles.tab, focused && tabStyles.tabActive]}>
              <Ionicons name={item.icon} size={16} color={focused ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{t(`eco.${item.label}`)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function EcosystemTabs() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Tab.Navigator tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ swipeEnabled: true, lazy: true }}>
        <Tab.Screen name="SchemesTab" component={GovernmentSchemesScreen} />
        <Tab.Screen name="CommunityTab" component={CommunityFeedScreen} />
        <Tab.Screen name="LearnTab" component={KnowledgeCenterScreen} />
        <Tab.Screen name="AlertsTab" component={RegionalAlertsScreen} />
      </Tab.Navigator>
    </View>
  );
}

export default function EcosystemStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EcosystemHome" component={EcosystemTabs} />
      <Stack.Screen name="CropPriceDetail" component={CropPriceDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="VideoLearningHub" component={VideoLearningHubScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="FarmerDirectory" component={FarmerDirectoryScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: { backgroundColor: colors.background, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  scroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  labelActive: { color: '#FFFFFF' },
});
