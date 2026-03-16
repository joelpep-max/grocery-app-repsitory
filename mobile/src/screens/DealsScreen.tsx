import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Linking, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBundles } from '@grocery-app/shared';
import type { BundleDeal } from '@grocery-app/shared';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { DealsScreenProps } from '../navigation/types';

const DealsScreen: React.FC<DealsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [bundles, setBundles] = useState<BundleDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBundles = async () => {
    const data = await getBundles();
    setBundles(data);
  };

  useEffect(() => {
    fetchBundles().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBundles();
    setRefreshing(false);
  };

  const renderBundle = ({ item }: { item: BundleDeal }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.provider}>{item.provider}</Text>
          {item.min_order_amount && (
            <Text style={styles.minOrder}>Min. order ${item.min_order_amount.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.discountBubble}>
          <Text style={styles.discountText}>
            {item.discount_type === 'percentage'
              ? `${item.discount_value}%`
              : `$${item.discount_value}`}
          </Text>
          <Text style={styles.discountOff}>OFF</Text>
        </View>
      </View>

      {item.item_names && (
        <View style={styles.items}>
          {item.item_names.split(',').map((name, i) => (
            <View key={i} style={styles.itemChip}>
              <Text style={styles.itemChipText}>{name.trim()}</Text>
            </View>
          ))}
        </View>
      )}

      {item.valid_until && (
        <Text style={styles.validity}>
          Valid until {new Date(item.valid_until).toLocaleDateString()}
        </Text>
      )}

      <View style={styles.cardFooter}>
        {item.provider_url && (
          <TouchableOpacity onPress={() => Linking.openURL(item.provider_url!)}>
            <Text style={styles.visitLink}>Visit {item.provider} →</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.shopNowBtn}
          onPress={() => navigation.getParent()?.navigate('ShopTab')}
        >
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Bundle Deals</Text>
      <Text style={styles.headerSubtitle}>
        Add qualifying items to your cart and these deals are automatically applied at checkout.
      </Text>
    </View>
  );

  const ListFooter = () => (
    <View style={styles.howItWorks}>
      <Text style={styles.howTitle}>💡 How Bundle Deals Work</Text>
      <Text style={styles.howItem}>1. Add qualifying items to your cart</Text>
      <Text style={styles.howItem}>2. Matching deals appear automatically at checkout</Text>
      <Text style={styles.howItem}>3. Select the best deal to maximize your savings</Text>
      <Text style={styles.howItem}>4. Discount is applied to your order total</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  return (
    <FlatList
      data={bundles}
      keyExtractor={b => b.id}
      renderItem={renderBundle}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.lg }]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={styles.emptyTitle}>No deals available</Text>
          <Text style={styles.emptySubtitle}>Check back soon for bundle savings!</Text>
        </View>
      }
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, minHeight: 200 },
  header: { marginBottom: spacing.lg },
  headerTitle: { fontSize: typography.xxl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.xs },
  headerSubtitle: { fontSize: typography.sm, color: colors.gray600, lineHeight: 20 },
  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.xl,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
    borderLeftWidth: 4, borderLeftColor: colors.primary500,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardLeft: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: typography.lg, fontWeight: '700', color: colors.gray900, marginBottom: 2 },
  provider: { fontSize: typography.sm, color: colors.gray600, marginBottom: 2 },
  minOrder: { fontSize: typography.xs, color: colors.gray400 },
  discountBubble: {
    backgroundColor: colors.primary600, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm, paddingVertical: 6, alignItems: 'center', minWidth: 54,
  },
  discountText: { fontSize: typography.xl, fontWeight: '800', color: colors.white, lineHeight: 26 },
  discountOff: { fontSize: typography.xs, fontWeight: '700', color: colors.primary200, lineHeight: 14 },
  items: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  itemChip: {
    backgroundColor: colors.gray100, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  itemChipText: { fontSize: typography.xs, color: colors.gray700 },
  validity: { fontSize: typography.xs, color: colors.gray400, marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  visitLink: { fontSize: typography.sm, color: colors.primary600, fontWeight: '500' },
  shopNowBtn: {
    backgroundColor: colors.primary600, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full,
  },
  shopNowText: { color: colors.white, fontSize: typography.sm, fontWeight: '700' },
  howItWorks: {
    backgroundColor: colors.primary50, borderRadius: borderRadius.xl,
    padding: spacing.lg, marginTop: spacing.sm,
  },
  howTitle: { fontSize: typography.base, fontWeight: '700', color: colors.primary800, marginBottom: spacing.md },
  howItem: { fontSize: typography.sm, color: colors.primary700, marginBottom: spacing.xs, lineHeight: 20 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.xl, fontWeight: '700', color: colors.gray700, marginBottom: spacing.xs },
  emptySubtitle: { fontSize: typography.sm, color: colors.gray500 },
});

export default DealsScreen;
