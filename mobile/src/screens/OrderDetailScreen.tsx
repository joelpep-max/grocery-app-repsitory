import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getOrder } from '@grocery-app/shared';
import type { OrderWithItems, OrderStatus } from '@grocery-app/shared';
import { useAppStore } from '../store';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { OrderDetailScreenProps } from '../navigation/types';

const STATUS_STEPS: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered',
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; icon: string }> = {
  pending: { label: 'Pending', bg: colors.yellow100, text: colors.yellow800, icon: '⏳' },
  confirmed: { label: 'Confirmed', bg: colors.blue50, text: colors.blue700, icon: '✅' },
  processing: { label: 'Processing', bg: colors.indigo100, text: colors.indigo800, icon: '⚙️' },
  ready: { label: 'Ready', bg: colors.teal100, text: colors.teal800, icon: '📦' },
  out_for_delivery: { label: 'Out for Delivery', bg: colors.orange100, text: colors.orange800, icon: '🚚' },
  delivered: { label: 'Delivered', bg: colors.green100, text: colors.green700, icon: '🎉' },
  cancelled: { label: 'Cancelled', bg: colors.red50, text: colors.red500, icon: '❌' },
};

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ route }) => {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const sessionId = useAppStore(s => s.sessionId);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(sessionId, orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId, sessionId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Order not found</Text>
      </View>
    );
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const progressPct = order.status === 'cancelled' ? 0 : Math.max(4, (currentStep / (STATUS_STEPS.length - 1)) * 100);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
    >
      {/* Order header */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.date}>
              {new Date(order.created_at).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.icon} {status.label}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        {order.status !== 'cancelled' && (
          <View style={styles.progressSection}>
            <View style={styles.progressSteps}>
              {STATUS_STEPS.map((step, i) => (
                <Text key={step} style={[styles.stepIcon, i <= currentStep && styles.stepIconActive]}>
                  {STATUS_CONFIG[step].icon}
                </Text>
              ))}
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* Fulfillment details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fulfillment</Text>
        <DetailRow label="Type" value={order.fulfillment_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'} />
        {order.fulfillment_address && <DetailRow label="Address" value={order.fulfillment_address} />}
        {order.fulfillment_store && <DetailRow label="Store" value={order.fulfillment_store} />}
        {order.scheduled_at && (
          <DetailRow label="Scheduled" value={new Date(order.scheduled_at).toLocaleString()} />
        )}
        {order.notes && <DetailRow label="Notes" value={order.notes} />}
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
        {order.items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              <Text style={styles.itemMeta}>
                {[item.brand, item.quality_tier].filter(Boolean).join(' · ')}
              </Text>
              {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemQtyPrice}>×{item.quantity} @ ${item.unit_price.toFixed(2)}</Text>
              <Text style={styles.itemTotal}>${item.line_total.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Payment summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <SummaryRow label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
        {order.discount_amount > 0 && (
          <SummaryRow
            label="Discount"
            value={`-$${order.discount_amount.toFixed(2)}`}
            green
          />
        )}
        <SummaryRow label="Tax" value={`$${order.tax_amount.toFixed(2)}`} />
        <SummaryRow label="Total" value={`$${order.total.toFixed(2)}`} bold />
      </View>
    </ScrollView>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const SummaryRow: React.FC<{ label: string; value: string; bold?: boolean; green?: boolean }> = ({
  label, value, bold, green,
}) => (
  <View style={[styles.summaryRow, bold && styles.summaryRowTotal]}>
    <Text style={[styles.summaryLabel, bold && styles.summaryLabelBold]}>{label}</Text>
    <Text style={[styles.summaryValue, bold && styles.summaryValueBold, green && { color: colors.green700 }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: typography.lg, color: colors.gray500 },
  section: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  orderId: { fontSize: typography.xl, fontWeight: '800', color: colors.gray900, marginBottom: 2 },
  date: { fontSize: typography.xs, color: colors.gray500 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: borderRadius.full },
  statusText: { fontSize: typography.xs, fontWeight: '600' },
  progressSection: { marginTop: spacing.sm },
  progressSteps: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  stepIcon: { fontSize: 16, opacity: 0.3 },
  stepIconActive: { opacity: 1 },
  progressTrack: { height: 6, backgroundColor: colors.gray200, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: colors.primary500, borderRadius: 3 },
  sectionTitle: { fontSize: typography.base, fontWeight: '700', color: colors.gray900, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', marginBottom: spacing.xs },
  detailLabel: { width: 80, fontSize: typography.sm, color: colors.gray500, fontWeight: '500' },
  detailValue: { flex: 1, fontSize: typography.sm, color: colors.gray900 },
  itemRow: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  itemInfo: { flex: 1, marginRight: spacing.sm },
  itemName: { fontSize: typography.sm, fontWeight: '600', color: colors.gray900, marginBottom: 2 },
  itemMeta: { fontSize: typography.xs, color: colors.gray500, marginBottom: 2 },
  itemNotes: { fontSize: typography.xs, color: colors.gray400, fontStyle: 'italic' },
  itemRight: { alignItems: 'flex-end' },
  itemQtyPrice: { fontSize: typography.xs, color: colors.gray600, marginBottom: 2 },
  itemTotal: { fontSize: typography.sm, fontWeight: '600', color: colors.gray900 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryRowTotal: { borderTopWidth: 1, borderTopColor: colors.gray200, paddingTop: spacing.sm, marginTop: spacing.xs, marginBottom: 0 },
  summaryLabel: { fontSize: typography.sm, color: colors.gray600 },
  summaryLabelBold: { fontSize: typography.base, fontWeight: '700', color: colors.gray900 },
  summaryValue: { fontSize: typography.sm, color: colors.gray900 },
  summaryValueBold: { fontSize: typography.base, fontWeight: '700' },
});

export default OrderDetailScreen;
