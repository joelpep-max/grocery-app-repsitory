import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getOrders } from '@grocery-app/shared';
import type { Order } from '@grocery-app/shared';
import { useAppStore } from '../store';
import { colors, spacing, typography } from '../theme';
import OrderCard from '../components/OrderCard';
import type { OrdersScreenProps } from '../navigation/types';

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sessionId = useAppStore(s => s.sessionId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    const data = await getOrders(sessionId);
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, [sessionId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.getParent()?.navigate('ShopTab')}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={o => o.id}
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        />
      )}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: insets.bottom + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary600}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: typography.xxl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: typography.base, color: colors.gray500, textAlign: 'center', marginBottom: spacing.xl },
  shopBtn: {
    backgroundColor: colors.primary600,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  shopBtnText: { color: colors.white, fontSize: typography.base, fontWeight: '700' },
});

export default OrdersScreen;
