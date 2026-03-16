import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import type { OrderConfirmScreenProps } from '../navigation/types';

const OrderConfirmScreen: React.FC<OrderConfirmScreenProps> = ({ route, navigation }) => {
  const { order } = route.params;
  const insets = useSafeAreaInsets();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, useNativeDriver: true,
        tension: 50, friction: 5,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
      {/* Success animation */}
      <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.checkIcon}>✓</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.subtitle}>
          {order.fulfillment_type === 'delivery'
            ? '🚚 We\'ll deliver to your address'
            : '🏪 Ready for pickup at your selected store'}
        </Text>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{(order as { items: unknown[] }).items.length}</Text>
          </View>
          {order.discount_amount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.green700 }]}>Savings</Text>
              <Text style={[styles.summaryValue, { color: colors.green700 }]}>
                -${order.discount_amount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Charged</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* CTAs */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            navigation.getParent()?.navigate('OrdersTab', {
              screen: 'OrderDetail',
              params: { orderId: order.id },
            });
          }}
        >
          <Text style={styles.primaryBtnText}>View Order Status</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.getParent()?.navigate('ShopTab')}
        >
          <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  checkCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.primary600,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  checkIcon: { fontSize: 48, color: colors.white, fontWeight: '700', lineHeight: 56 },
  title: { fontSize: typography.xxxl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.xs },
  orderId: { fontSize: typography.base, color: colors.gray500, fontWeight: '500', marginBottom: spacing.sm },
  subtitle: { fontSize: typography.base, color: colors.gray600, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  summary: {
    width: '100%', backgroundColor: colors.gray50, borderRadius: borderRadius.xl,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: typography.sm, color: colors.gray600 },
  summaryValue: { fontSize: typography.sm, color: colors.gray900, fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.gray200, paddingTop: spacing.sm, marginTop: spacing.xs, marginBottom: 0 },
  totalLabel: { fontSize: typography.base, fontWeight: '700', color: colors.gray900 },
  totalValue: { fontSize: typography.base, fontWeight: '700', color: colors.gray900 },
  actions: { width: '100%', gap: spacing.sm },
  primaryBtn: { backgroundColor: colors.primary600, borderRadius: borderRadius.xl, paddingVertical: spacing.lg, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontSize: typography.base, fontWeight: '700' },
  secondaryBtn: { borderWidth: 1.5, borderColor: colors.gray300, borderRadius: borderRadius.xl, paddingVertical: spacing.lg, alignItems: 'center' },
  secondaryBtnText: { color: colors.gray700, fontSize: typography.base, fontWeight: '600' },
});

export default OrderConfirmScreen;
