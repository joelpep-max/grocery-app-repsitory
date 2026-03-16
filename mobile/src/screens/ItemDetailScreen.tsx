import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getItem, addToCart, getCart } from '@grocery-app/shared';
import type { ItemVariant } from '@grocery-app/shared';
import { useAppStore } from '../store';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import VariantSelector from '../components/VariantSelector';
import type { ItemDetailScreenProps } from '../navigation/types';

const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ route, navigation }) => {
  const { item } = route.params;
  const insets = useSafeAreaInsets();

  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [filterOrganic, setFilterOrganic] = useState(false);

  const sessionId = useAppStore(s => s.sessionId);
  const setCart = useAppStore(s => s.setCart);

  useEffect(() => {
    getItem(item.id).then(data => {
      setVariants(data.variants);
      const standard = data.variants.find(v => v.quality_tier === 'standard');
      setSelectedVariant(standard ?? data.variants[0] ?? null);
      setLoading(false);
    });
  }, [item.id]);

  const filteredVariants = variants.filter(v => !filterOrganic || v.is_organic === 1);

  const handleAdd = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    try {
      await addToCart(sessionId, {
        item_id: item.id,
        variant_id: selectedVariant.id,
        quantity,
        notes: notes || undefined,
      });
      const cart = await getCart(sessionId);
      setCart(cart);
      setAdded(true);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e) {
      // show nothing — could add a toast here
    } finally {
      setAdding(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Hero icon area */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>{item.category_icon}</Text>
          <View style={styles.heroBadges}>
            <Text style={styles.categoryLabel}>{item.category_name}</Text>
            {item.has_organic === 1 && (
              <View style={styles.organicBadge}>
                <Text style={styles.organicText}>🌱 Organic available</Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{item.name}</Text>
          {item.description && <Text style={styles.description}>{item.description}</Text>}

          {/* Organic filter */}
          {item.has_organic === 1 && (
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.organicToggle, filterOrganic && styles.organicToggleActive]}
                onPress={() => setFilterOrganic(!filterOrganic)}
              >
                <Text style={[styles.organicToggleText, filterOrganic && styles.organicToggleTextActive]}>
                  🌱 Show organic only
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Variants */}
          <Text style={styles.sectionLabel}>Choose Brand & Quality</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary600} style={{ marginVertical: spacing.xl }} />
          ) : filteredVariants.length === 0 ? (
            <Text style={styles.noVariants}>No variants match your filter.</Text>
          ) : (
            <VariantSelector
              variants={filteredVariants}
              selectedId={selectedVariant?.id ?? null}
              onSelect={setSelectedVariant}
            />
          )}

          {/* Quantity */}
          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(q => q + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            {selectedVariant && (
              <Text style={styles.lineTotal}>
                Total: <Text style={styles.lineTotalValue}>
                  ${(selectedVariant.base_price * quantity).toFixed(2)}
                </Text>
              </Text>
            )}
          </View>

          {/* Notes */}
          <Text style={styles.sectionLabel}>Special Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Ripe but not overripe, no substitutions..."
            placeholderTextColor={colors.gray400}
            style={styles.notesInput}
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        {/* Sticky Add to Cart button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={[
              styles.addBtn,
              (!selectedVariant || adding || added) && styles.addBtnDisabled,
              added && styles.addBtnSuccess,
            ]}
            onPress={handleAdd}
            disabled={!selectedVariant || adding || added}
          >
            {adding ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.addBtnText}>
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  hero: {
    backgroundColor: colors.primary50,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  heroIcon: { fontSize: 64, marginBottom: spacing.sm },
  heroBadges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  categoryLabel: { fontSize: typography.sm, color: colors.gray600, fontWeight: '500' },
  organicBadge: {
    backgroundColor: colors.green100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  organicText: { fontSize: typography.xs, color: colors.green700, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { fontSize: typography.xxl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.xs },
  description: { fontSize: typography.base, color: colors.gray600, lineHeight: 22, marginBottom: spacing.md },
  filterRow: { marginBottom: spacing.md },
  organicToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  organicToggleActive: { backgroundColor: colors.green100, borderColor: colors.primary500 },
  organicToggleText: { fontSize: typography.sm, color: colors.gray700, fontWeight: '500' },
  organicToggleTextActive: { color: colors.green700, fontWeight: '600' },
  sectionLabel: {
    fontSize: typography.base,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  noVariants: { fontSize: typography.sm, color: colors.gray500, textAlign: 'center', paddingVertical: spacing.xl },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: colors.gray300,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white,
  },
  qtyBtnText: { fontSize: 20, color: colors.gray700, fontWeight: '600', lineHeight: 24 },
  qtyValue: { fontSize: typography.xl, fontWeight: '700', color: colors.gray900, width: 30, textAlign: 'center' },
  lineTotal: { fontSize: typography.base, color: colors.gray600, marginLeft: 'auto' as unknown as number },
  lineTotalValue: { fontWeight: '700', color: colors.gray900 },
  notesInput: {
    borderWidth: 1.5, borderColor: colors.gray300, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: typography.base, color: colors.gray900,
    backgroundColor: colors.white, textAlignVertical: 'top', minHeight: 72,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    ...shadows.md,
  },
  addBtn: {
    backgroundColor: colors.primary600, borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg, alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: colors.gray300 },
  addBtnSuccess: { backgroundColor: colors.green600 },
  addBtnText: { fontSize: typography.lg, fontWeight: '700', color: colors.white },
});

export default ItemDetailScreen;
