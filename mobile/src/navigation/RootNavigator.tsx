import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store';
import { colors } from '../theme';

import type {
  RootTabParamList,
  ShopStackParamList,
  CartStackParamList,
  OrdersStackParamList,
  DealsStackParamList,
} from './types';

// Screens
import ShopScreen from '../screens/ShopScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmScreen from '../screens/OrderConfirmScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import DealsScreen from '../screens/DealsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const DealsStack = createNativeStackNavigator<DealsStackParamList>();

function ShopNavigator() {
  return (
    <ShopStack.Navigator screenOptions={{ headerTintColor: colors.primary700 }}>
      <ShopStack.Screen name="Shop" component={ShopScreen} options={{ title: 'GrocerEase' }} />
      <ShopStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: '' }} />
    </ShopStack.Navigator>
  );
}

function CartNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerTintColor: colors.primary700 }}>
      <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <CartStack.Screen
        name="OrderConfirm"
        component={OrderConfirmScreen}
        options={{ title: 'Order Confirmed', headerLeft: () => null }}
      />
    </CartStack.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerTintColor: colors.primary700 }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </OrdersStack.Navigator>
  );
}

function DealsNavigator() {
  return (
    <DealsStack.Navigator screenOptions={{ headerTintColor: colors.primary700 }}>
      <DealsStack.Screen name="Deals" component={DealsScreen} options={{ title: 'Bundle Deals' }} />
    </DealsStack.Navigator>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
  );
}

export default function RootNavigator() {
  const cart = useAppStore(s => s.cart);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary700,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          borderTopColor: colors.gray200,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
      }}
    >
      <Tab.Screen
        name="ShopTab"
        component={ShopNavigator}
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartNavigator}
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" focused={focused} />,
          tabBarBadge: cartCount > 0 ? (cartCount > 99 ? '99+' : cartCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.red500, fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersNavigator}
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DealsTab"
        component={DealsNavigator}
        options={{
          title: 'Deals',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏷️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
