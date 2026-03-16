import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { Item, Order } from '@grocery-app/shared';

// Bottom tab param list
export type RootTabParamList = {
  ShopTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  DealsTab: undefined;
};

// Shop stack
export type ShopStackParamList = {
  Shop: undefined;
  ItemDetail: { item: Item };
};

// Cart stack
export type CartStackParamList = {
  Cart: undefined;
  Checkout: { bundleDealId?: string };
  OrderConfirm: { order: Order & { items: unknown[] } };
};

// Orders stack
export type OrdersStackParamList = {
  Orders: undefined;
  OrderDetail: { orderId: string };
};

// Deals stack
export type DealsStackParamList = {
  Deals: undefined;
};

// Composite props helpers
export type ShopScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ShopStackParamList, 'Shop'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ItemDetailScreenProps = NativeStackScreenProps<ShopStackParamList, 'ItemDetail'>;

export type CartScreenProps = CompositeScreenProps<
  NativeStackScreenProps<CartStackParamList, 'Cart'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type CheckoutScreenProps = NativeStackScreenProps<CartStackParamList, 'Checkout'>;
export type OrderConfirmScreenProps = NativeStackScreenProps<CartStackParamList, 'OrderConfirm'>;

export type OrdersScreenProps = CompositeScreenProps<
  NativeStackScreenProps<OrdersStackParamList, 'Orders'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type OrderDetailScreenProps = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;

export type DealsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DealsStackParamList, 'Deals'>,
  BottomTabScreenProps<RootTabParamList>
>;
