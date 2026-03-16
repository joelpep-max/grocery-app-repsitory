import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { Item } from '@grocery-app/shared';
import { addToCart, getCart } from '@grocery-app/shared';
import { useAppStore } from '../store';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface Props {
  item: Item;
  onPress: (item: Item) => void;
}

const ItemCard: React.FC<Props> = ({ item, onPress }) => {
  const [adding, setAdding] = useState(false);
  const sessionId = useAppStore(s => s.sessionId);
  const setCart = useAppStore(s => s.setCart);

  const handleQuickAdd = async () => {
    setAdding(true);
    try {
      await addToCart(sessionId, { item_id: item.id, quantity: 1 });
      const cart = await getCart(sessionId);
      setCart(cart);
    } catch (e) {
      // silently ignore
    } finally {
      setAdding(false);
    }
  };

  const priceDisplay =
    item.min_price != null
      ? item.min_price === item.max_price
        ? `$${item.min_price.toFixed(2)}`
        : `$${item.min_price.toFixed(2)}–$${item.max_price!.toFixed(2)}`
      : 'Varies';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      {/* Icon area */}
      <View style={styles.iconArea}>
        <Text style={styles.icon}>{item.category_icon}</Text>
        {item.has_organic === 1 && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicBadgeText}>🌱</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>{item.category_name}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{priceDisplay}</Text>
            <Text style={styles.unit}>per {item.unit}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, adding && styles.addBtnDisabled]}
            onPress={handleQuickAdd}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.addBtnText}>+</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    flex: 1,
    ...shadows.sm,
  },
  iconArea: {
    height: 90,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
  },
  organicBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.green100,
    borderRadius: borderRadius.full,
    padding: 3,
  },
  organicBadgeText: {
    fontSize: 12,
  },
  body: {
    padding: spacing.sm + 2,
  },
  category: {
    fontSize: typography.xs,
    color: colors.gray500,
    marginBottom: 2,
  },
  name: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.gray900,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  price: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: colors.primary700,
  },
  unit: {
    fontSize: typography.xs,
    color: colors.gray400,
  },
  addBtn: {
    backgroundColor: colors.primary600,
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: colors.gray300,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 24,
  },
});

export default ItemCard;
