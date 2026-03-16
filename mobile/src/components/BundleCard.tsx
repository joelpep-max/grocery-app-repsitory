import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { BundleRecommendation } from '@grocery-app/shared';
import { colors, spacing, borderRadius, typography } from '../theme';

interface Props {
  bundle: BundleRecommendation;
  selected: boolean;
  onSelect: () => void;
}

const BundleCard: React.FC<Props> = ({ bundle, selected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{bundle.name}</Text>
          <Text style={styles.provider}>{bundle.provider}</Text>
        </View>
        <View style={[styles.discount, selected && styles.discountSelected]}>
          <Text style={[styles.discountText, selected && styles.discountTextSelected]}>
            {bundle.discount_type === 'percentage'
              ? `${bundle.discount_value}% OFF`
              : `$${bundle.discount_value} OFF`}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.savings}>
          💰 Save ${bundle.estimated_savings.toFixed(2)}
        </Text>
        <Text style={styles.match}>
          {bundle.match_percentage}% match
        </Text>
      </View>

      {selected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>✓ Applied</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.amber50,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.amber200,
  },
  cardSelected: {
    borderColor: colors.primary500,
    backgroundColor: colors.primary50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.amber900,
    marginBottom: 2,
  },
  provider: {
    fontSize: typography.sm,
    color: colors.gray600,
  },
  discount: {
    backgroundColor: colors.amber200,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  discountSelected: {
    backgroundColor: colors.primary200,
  },
  discountText: {
    fontSize: typography.xs,
    fontWeight: '700',
    color: colors.amber700,
  },
  discountTextSelected: {
    color: colors.primary800,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savings: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.green700,
  },
  match: {
    fontSize: typography.xs,
    color: colors.gray500,
  },
  selectedBadge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary600,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  selectedBadgeText: {
    fontSize: typography.xs,
    fontWeight: '600',
    color: colors.white,
  },
});

export default BundleCard;
