import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { CartItem } from '@grocery-app/shared';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface Props {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  loading?: boolean;
}

const CartItemRow: React.FC<Props> = ({ item, onIncrement, onDecrement, onRemove, loading }) => {
  const lineTotal = (item.base_price ?? 0) * item.quantity;

  return (
    <View style={[styles.row, loading && styles.rowLoading]}>
      <View style={styles.iconArea}>
        <Text style={styles.icon}>{item.category_icon}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{item.item_name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[item.brand, item.size, item.quality_tier]
            .filter(Boolean)
            .join(' · ')}
          {item.is_organic === 1 ? ' · 🌱' : ''}
        </Text>
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={1}>📝 {item.notes}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.total}>${lineTotal.toFixed(2)}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepBtn} onPress={onDecrement} disabled={loading}>
            <Text style={styles.stepBtnText}>-</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary600} style={{ width: 24 }} />
          ) : (
            <Text style={styles.qty}>{item.quantity}</Text>
          )}
          <TouchableOpacity style={styles.stepBtn} onPress={onIncrement} disabled={loading}>
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onRemove} disabled={loading}>
          <Text style={styles.remove}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  rowLoading: {
    opacity: 0.5,
  },
  iconArea: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  icon: {
    fontSize: 22,
  },
  details: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: typography.base,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  meta: {
    fontSize: typography.xs,
    color: colors.gray500,
    marginBottom: 2,
  },
  notes: {
    fontSize: typography.xs,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  total: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.gray900,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
    lineHeight: 20,
  },
  qty: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.gray900,
    width: 24,
    textAlign: 'center',
  },
  remove: {
    fontSize: typography.xs,
    color: colors.red500,
    fontWeight: '500',
  },
});

export default CartItemRow;
