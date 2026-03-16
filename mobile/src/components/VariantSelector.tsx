import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { ItemVariant, QualityTier } from '@grocery-app/shared';
import { colors, spacing, borderRadius, typography } from '../theme';

const qualityConfig: Record<QualityTier, { label: string; bg: string; text: string; border: string }> = {
  budget: { label: 'Budget', bg: colors.gray100, text: colors.gray700, border: colors.gray300 },
  standard: { label: 'Standard', bg: colors.blue50, text: colors.blue700, border: '#bfdbfe' },
  premium: { label: 'Premium', bg: colors.amber50, text: colors.amber700, border: colors.amber200 },
};

interface Props {
  variants: ItemVariant[];
  selectedId: string | null;
  onSelect: (variant: ItemVariant) => void;
}

const VariantSelector: React.FC<Props> = ({ variants, selectedId, onSelect }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {variants.map(variant => {
        const qc = qualityConfig[variant.quality_tier] ?? qualityConfig.standard;
        const isSelected = selectedId === variant.id;

        return (
          <TouchableOpacity
            key={variant.id}
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onSelect(variant)}
            activeOpacity={0.8}
          >
            <View style={styles.checkBox}>
              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </View>

            <View style={styles.info}>
              <Text style={styles.brand}>
                {variant.brand ?? 'Generic'}
                {variant.size ? <Text style={styles.size}> ({variant.size})</Text> : null}
              </Text>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: qc.bg, borderColor: qc.border }]}>
                  <Text style={[styles.badgeText, { color: qc.text }]}>{qc.label}</Text>
                </View>
                {variant.is_organic === 1 && (
                  <View style={[styles.badge, { backgroundColor: colors.green50, borderColor: colors.primary300 }]}>
                    <Text style={[styles.badgeText, { color: colors.green700 }]}>🌱 Organic</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.price}>${variant.base_price.toFixed(2)}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  rowSelected: {
    borderColor: colors.primary500,
    backgroundColor: colors.primary50,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkMark: {
    fontSize: 12,
    color: colors.primary600,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: typography.base,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  size: {
    fontWeight: '400',
    color: colors.gray500,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: '500',
  },
  price: {
    fontSize: typography.lg,
    fontWeight: '700',
    color: colors.primary700,
    marginLeft: spacing.sm,
  },
});

export default VariantSelector;
