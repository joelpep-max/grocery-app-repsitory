import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import type { Category } from '@grocery-app/shared';
import { colors, spacing, borderRadius, typography } from '../theme';

interface Props {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const CategoryFilter: React.FC<Props> = ({ categories, selectedId, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        onPress={() => onSelect(null)}
        style={[styles.chip, selectedId === null && styles.chipActive]}
      >
        <Text style={[styles.chipText, selectedId === null && styles.chipTextActive]}>
          🏪 All
        </Text>
      </TouchableOpacity>

      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          onPress={() => onSelect(cat.id)}
          style={[styles.chip, selectedId === cat.id && styles.chipActive]}
        >
          <Text style={[styles.chipText, selectedId === cat.id && styles.chipTextActive]}>
            {cat.icon} {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary500,
  },
  chipText: {
    fontSize: typography.sm,
    color: colors.gray700,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary800,
    fontWeight: '600',
  },
});

export default CategoryFilter;
