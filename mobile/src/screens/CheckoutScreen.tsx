import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createOrder, getCart, getRecommendedBundles } from '@grocery-app/shared';
import type { FulfillmentType, BundleRecommendation } from '@grocery-app/shared';
import { useAppStore } from '../store';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import BundleCard from '../components/BundleCard';
import type { CheckoutScreenProps } from '../navigation/types';

const STORES = [
  'Downtown Market — 123 Main St',
  'Eastside Fresh — 456 Oak Ave',
  'Westfield Grocery — 789 Pine Rd',
  'Northgate Market — 321 Elm St',
];

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const sessionId = useAppStore(s => s.sessionId);
  const cart = useAppStore(s => s.cart);
  const setCart = useAppStore(s => s.setCart);

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [address, setAddress] = useState('');
  const [storeIndex, setStoreIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<string>(route.params?.bundleDealId ?? '');
  const [bundles, setBundles] = useState<BundleRecommendation[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRecommendedBundles(sessionId).then(d => setBundles(d.bundles));
  }, [sessionId]);

  if (!cart || cart.items.length === 0) {
    navigation.goBack();
    return null;
  }

  const bundle = bundles.find(b => b.id === selectedBundle);
  const discount = bundle
    ? bundle.discount_type === 'percentage'
      ? (cart.subtotal * bundle.discount_value) / 100
      : bundle.discount_value
    : 0;
  const tax = (cart.subtotal - discount) * 0.08;
  const total = cart.subtotal - discount + tax;

  const handlePlaceOrder = async () => {
    if (fulfillmentType === 'delivery' && !address.trim()) {
      Alert.alert('Missing Info', 'Please enter a delivery address.');
      return;
    }
    if (fulfillmentType === 'pickup' && storeIndex === null) {
      Alert.alert('Missing Info', 'Please select a pickup store.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder(sessionId, {
        fulfillment_type: fulfillmentType,
        fulfillment_address: fulfillmentType === 'delivery' ? address : undefined,
        fulfillment_store: fulfillmentType === 'pickup' && storeIndex !== null ? STORES[storeIndex] : undefined,
        bundle_deal_id: selectedBundle || undefined,
        notes: notes || undefined,
      });
      const updated = await getCart(sessionId);
      setCart(updated);
      navigation.replace('OrderConfirm', { order });
    } catch {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        >
          {/* Fulfillment type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fulfillment</Text>
            <View style={styles.segmented}>
              {(['delivery', 'pickup'] as FulfillmentType[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.segment, fulfillmentType === type && styles.segmentActive]}
                  onPress={() => setFulfillmentType(type)}
                >
                  <Text style={styles.segmentIcon}>{type === 'delivery' ? '🚚' : '🏪'}</Text>
                  <Text style={[styles.segmentText, fulfillmentType === type && styles.segmentTextActive]}>
                    {type === 'delivery' ? 'Delivery' : 'Pickup'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {fulfillmentType === 'delivery' ? (
              <>
                <Text style={styles.fieldLabel}>Delivery Address *</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="123 Main St, City, State ZIP"
                  placeholderTextColor={colors.gray400}
                  style={styles.textInput}
                />
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Select Store *</Text>
                {STORES.map((store, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.storeOption, storeIndex === i && styles.storeOptionActive]}
                    onPress={() => setStoreIndex(i)}
                  >
                    <Text style={[styles.storeText, storeIndex === i && styles.storeTextActive]}>
                      {storeIndex === i ? '✓ ' : ''}{store}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>

          {/* Bundle deals */}
          {bundles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Apply Bundle Deal</Text>
              <TouchableOpacity
                style={[styles.noDealBtn, !selectedBundle && styles.noDealBtnActive]}
                onPress={() => setSelectedBundle('')}
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
                  onSelect={() => setSelectedBundle(selectedBundle === b.id ? '' : b.id)}
                />
              ))}
            </View>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special instructions..."
              placeholderTextColor={colors.gray400}
              style={[styles.textInput, { minHeight: 72, textAlignVertical: 'top' }]}
              multiline
            />
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            {cart.items.map(item => (
              <View key={item.id} style={styles.summaryRow}>
                <Text style={styles.summaryItem} numberOfLines={1}>
                  {item.item_name}{item.brand ? ` (${item.brand})` : ''}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ${item.base_price != null ? (item.base_price * item.quantity).toFixed(2) : '—'}
                </Text>
              </View>
            ))}
            <View style={[styles.summaryRow, { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray200 }]}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.green700 }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: colors.green700 }]}>-${discount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Place Order footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TouchableOpacity
            style={[styles.placeBtn, submitting && styles.placeBtnDisabled]}
            onPress={handlePlaceOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.placeBtnText}>Place Order · ${total.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  content: { padding: spacing.lg },
  section: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  sectionTitle: { fontSize: typography.base, fontWeight: '700', color: colors.gray900, marginBottom: spacing.md },
  segmented: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  segment: {
    flex: 1, padding: spacing.md, borderRadius: borderRadius.lg,
    borderWidth: 2, borderColor: colors.gray200, alignItems: 'center', gap: 4,
  },
  segmentActive: { borderColor: colors.primary500, backgroundColor: colors.primary50 },
  segmentIcon: { fontSize: 22 },
  segmentText: { fontSize: typography.sm, fontWeight: '600', color: colors.gray600 },
  segmentTextActive: { color: colors.primary800 },
  fieldLabel: { fontSize: typography.sm, fontWeight: '600', color: colors.gray700, marginBottom: spacing.xs },
  textInput: {
    borderWidth: 1.5, borderColor: colors.gray300, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    fontSize: typography.base, color: colors.gray900, backgroundColor: colors.white,
  },
  storeOption: {
    padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1,
    borderColor: colors.gray200, marginBottom: spacing.xs, backgroundColor: colors.gray50,
  },
  storeOptionActive: { borderColor: colors.primary500, backgroundColor: colors.primary50 },
  storeText: { fontSize: typography.sm, color: colors.gray700 },
  storeTextActive: { color: colors.primary800, fontWeight: '600' },
  noDealBtn: {
    padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1,
    borderColor: colors.gray200, marginBottom: spacing.sm, backgroundColor: colors.white,
  },
  noDealBtnActive: { borderColor: colors.primary400, backgroundColor: colors.primary50 },
  noDealText: { fontSize: typography.sm, color: colors.gray600 },
  noDealTextActive: { color: colors.primary700, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryItem: { fontSize: typography.sm, color: colors.gray700, flex: 1, marginRight: spacing.sm },
  summaryItemPrice: { fontSize: typography.sm, color: colors.gray900, fontWeight: '500' },
  summaryLabel: { fontSize: typography.sm, color: colors.gray600 },
  summaryValue: { fontSize: typography.sm, color: colors.gray900 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.gray200, paddingTop: spacing.sm, marginTop: spacing.xs, marginBottom: 0 },
  totalLabel: { fontSize: typography.lg, fontWeight: '700', color: colors.gray900 },
  totalValue: { fontSize: typography.lg, fontWeight: '700', color: colors.gray900 },
  footer: { padding: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200, ...shadows.md },
  placeBtn: { backgroundColor: colors.primary600, borderRadius: borderRadius.xl, paddingVertical: spacing.lg, alignItems: 'center' },
  placeBtnDisabled: { backgroundColor: colors.gray300 },
  placeBtnText: { color: colors.white, fontSize: typography.lg, fontWeight: '700' },
});

export default CheckoutScreen;
