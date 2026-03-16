import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCart, updateCartItem, removeFromCart, clearCart, getRecommendedBundles } from '@grocery-app/shared';
import type { BundleRecommendation } from '@grocery-app/shared';
import { useAppStore } from '../store';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import CartItemRow from '../components/CartItemRow';
import BundleCard from '../components/BundleCard';
import type { CartScreenProps } from '../navigation/types';

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sessionId = useAppStore(s => s.sessionId);
  const cart = useAppStore(s => s.cart);
  const setCart = useAppStore(s => s.setCart);

  const [bundles, setBundles] = useState<BundleRecommendation[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getCart(sessionId).then(setCart);
  }, [sessionId]);

  useEffect(() => {
    if (cart && cart.items.length > 0) {
      getRecommendedBundles(sessionId).then(d => setBundles(d.bundles));
    } else {
      setBundles([]);
    }
  }, [cart, sessionId]);

  const handleQuantityChange = async (cartItemId: string, delta: number, current: number) => {
    setUpdatingId(cartItemId);
    try {
      const newQty = current + delta;
      if (newQty <= 0) {
        await removeFromCart(sessionId, cartItemId);
      } else {
        await updateCartItem(sessionId, cartItemId, { quantity: newQty });
      }
      const updated = await getCart(sessionId);
      setCart(updated);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    setUpdatingId(cartItemId);
    try {
      await removeFromCart(sessionId, cartItemId);
      const updated = await getCart(sessionId);
      setCart(updated);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearCart(sessionId);
          const updated = await getCart(sessionId);
          setCart(updated);
          setBundles([]);
          setSelectedBundle(null);
        },
      },
    ]);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Browse items and add them to your cart</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.getParent()?.navigate('ShopTab')}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bundle = bundles.find(b => b.id === selectedBundle);
  const discount = bundle
    ? bundle.discount_type === 'percentage'
      ? (cart.subtotal * bundle.discount_value) / 100
      : bundle.discount_value
    : 0;
  const tax = (cart.subtotal - discount) * 0.08;
  const total = cart.subtotal - discount + tax;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Header actions */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            {cart.count} item{cart.count !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearBtn}>Clear all</Text>
          </TouchableOpacity>
        </View>

        {/* Cart items */}
        {cart.items.map(item => (
          <CartItemRow
            key={item.id}
            item={item}
            loading={updatingId === item.id}
            onIncrement={() => handleQuantityChange(item.id, 1, item.quantity)}
            onDecrement={() => handleQuantityChange(item.id, -1, item.quantity)}
            onRemove={() => handleRemove(item.id)}
          />
        ))}

        {/* Bundle deals */}
        {bundles.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏷️ Bundle Deals</Text>
            <TouchableOpacity
              style={[styles.noDealBtn, !selectedBundle && styles.noDealBtnActive]}
              onPress={() => setSelectedBundle(null)}
            >
              <Text style={[styles.noDealText, !selectedBundle && styles.noDealTextActive]}>
                {!selectedBundle ? '✓ ' : ''}No deal
              </Text>
            </TouchableOpacity>
            {bundles.map(b => (
              <BundleCard
                key={b.id}
                bundle={b}
                selected={selectedBundle === b.id}
                onSelect={() => setSelectedBundle(selectedBundle === b.id ? null : b.id)}
              />
            ))}
          </>
        )}

        {/* Price breakdown */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.green700 }]}>Bundle discount</Text>
              <Text style={[styles.summaryValue, { color: colors.green700 }]}>
                - ${discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout sticky footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout', { bundleDealId: selectedBundle ?? undefined })}
        >
          <Text style={styles.checkoutBtnText}>Checkout · ${total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  content: { padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  headerTitle: { fontSize: typography.lg, fontWeight: '700', color: colors.gray900 },
  clearBtn: { fontSize: typography.sm, color: colors.red500, fontWeight: '500' },
  sectionTitle: { fontSize: typography.base, fontWeight: '700', color: colors.gray800, marginTop: spacing.lg, marginBottom: spacing.sm },
  noDealBtn: {
    padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.gray200,
    backgroundColor: colors.white, marginBottom: spacing.sm,
  },
  noDealBtnActive: { borderColor: colors.primary400, backgroundColor: colors.primary50 },
  noDealText: { fontSize: typography.sm, color: colors.gray600 },
  noDealTextActive: { color: colors.primary700, fontWeight: '600' },
  summary: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.lg, ...shadows.sm,
  },
  summaryTitle: { fontSize: typography.base, fontWeight: '700', color: colors.gray900, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: typography.sm, color: colors.gray600 },
  summaryValue: { fontSize: typography.sm, color: colors.gray900 },
  summaryTotal: { borderTopWidth: 1, borderTopColor: colors.gray200, paddingTop: spacing.sm, marginTop: spacing.sm, marginBottom: 0 },
  totalLabel: { fontSize: typography.lg, fontWeight: '700', color: colors.gray900 },
  totalValue: { fontSize: typography.lg, fontWeight: '700', color: colors.gray900 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 64, marginBottom: spacing.lg },
  emptyTitle: { fontSize: typography.xxl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: typography.base, color: colors.gray500, textAlign: 'center', marginBottom: spacing.xl },
  shopBtn: { backgroundColor: colors.primary600, paddingHorizontal: spacing.xxxl, paddingVertical: spacing.md, borderRadius: borderRadius.xl },
  shopBtnText: { color: colors.white, fontSize: typography.base, fontWeight: '700' },
  footer: { padding: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200, ...shadows.md },
  checkoutBtn: { backgroundColor: colors.primary600, borderRadius: borderRadius.xl, paddingVertical: spacing.lg, alignItems: 'center' },
  checkoutBtnText: { color: colors.white, fontSize: typography.lg, fontWeight: '700' },
});

export default CartScreen;
