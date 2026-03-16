import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Order, OrderStatus } from '@grocery-app/shared';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string; icon: string }> = {
  pending: { label: 'Pending', bg: colors.yellow100, text: colors.yellow800, icon: '⏳' },
  confirmed: { label: 'Confirmed', bg: colors.blue50, text: colors.blue700, icon: '✅' },
  processing: { label: 'Processing', bg: colors.indigo100, text: colors.indigo800, icon: '⚙️' },
  ready: { label: 'Ready', bg: colors.teal100, text: colors.teal800, icon: '📦' },
  out_for_delivery: { label: 'Out for Delivery', bg: colors.orange100, text: colors.orange800, icon: '🚚' },
  delivered: { label: 'Delivered', bg: colors.green100, text: colors.green700, icon: '🎉' },
  cancelled: { label: 'Cancelled', bg: colors.red50, text: colors.red500, icon: '❌' },
};

interface Props {
  order: Order;
  onPress: () => void;
}

const OrderCard: React.FC<Props> = ({ order, onPress }) => {
  const status = statusConfig[order.status] ?? statusConfig.pending;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.top}>
        <View>
          <Text style={styles.date}>
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.orderId}>
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.fulfillment}>
            {order.fulfillment_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
          </Text>
        </View>

        <View style={styles.right}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.icon} {status.label}
            </Text>
          </View>
          <Text style={styles.total}>${order.total.toFixed(2)}</Text>
          {order.discount_amount > 0 && (
            <Text style={styles.savings}>Saved ${order.discount_amount.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    fontSize: typography.xs,
    color: colors.gray500,
    marginBottom: 2,
  },
  orderId: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 2,
  },
  fulfillment: {
    fontSize: typography.sm,
    color: colors.gray600,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.xs,
    fontWeight: '600',
  },
  total: {
    fontSize: typography.xl,
    fontWeight: '700',
    color: colors.gray900,
  },
  savings: {
    fontSize: typography.xs,
    color: colors.green700,
    fontWeight: '500',
  },
});

export default OrderCard;
