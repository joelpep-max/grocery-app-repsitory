import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text,
  StyleSheet, RefreshControl, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategories, getItems, getCart } from '@grocery-app/shared';
import type { Item } from '@grocery-app/shared';
import { useAppStore } from '../store';
import { colors, spacing, borderRadius, typography } from '../theme';
import CategoryFilter from '../components/CategoryFilter';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';
import type { ShopScreenProps } from '../navigation/types';

const ShopScreen: React.FC<ShopScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    sessionId, categories, selectedCategory, searchQuery,
    setCategories, setSelectedCategory, setSearchQuery, setCart, setCartLoading,
  } = useAppStore();

  const [items, setItems] = useState<Item[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterQuality, setFilterQuality] = useState('');
  const [filterOrganic, setFilterOrganic] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      getCategories().then(setCategories);
    }
    setCartLoading(true);
    getCart(sessionId)
      .then(setCart)
      .finally(() => setCartLoading(false));
  }, [sessionId]);

  const fetchItems = useCallback(
    async (pageNum: number, replace: boolean) => {
      setLoading(true);
      try {
        const data = await getItems({
          category_id: selectedCategory || undefined,
          search: searchQuery || undefined,
          quality_tier: filterQuality || undefined,
          is_organic: filterOrganic || undefined,
          page: pageNum,
          limit: 20,
        });
        setItems(prev => (replace ? data.items : [...prev, ...data.items]));
        setTotalItems(data.pagination.total);
        setHasMore(pageNum < data.pagination.pages);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, searchQuery, filterQuality, filterOrganic]
  );

  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchItems(1, true);
  }, [selectedCategory, searchQuery, filterQuality, filterOrganic]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchItems(next, false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems(1, true);
    setPage(1);
    setRefreshing(false);
  };

  const renderItem = ({ item, index }: { item: Item; index: number }) => (
    <View style={[styles.gridItem, index % 2 === 0 ? styles.gridLeft : styles.gridRight]}>
      <ItemCard item={item} onPress={() => navigation.navigate('ItemDetail', { item })} />
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.grid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={[styles.gridItem, i % 2 === 0 ? styles.gridLeft : styles.gridRight]}>
          <ItemCardSkeleton />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? 0 : spacing.sm }]}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search items..."
            placeholderTextColor={colors.gray400}
            style={styles.input}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Category chips */}
      <CategoryFilter
        categories={categories}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Quality / Organic filter row */}
      <View style={styles.filterRow}>
        {(['', 'budget', 'standard', 'premium'] as const).map(tier => (
          <TouchableOpacity
            key={tier}
            onPress={() => setFilterQuality(tier)}
            style={[styles.filterChip, filterQuality === tier && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filterQuality === tier && styles.filterChipTextActive]}>
              {tier === '' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setFilterOrganic(!filterOrganic)}
          style={[styles.filterChip, filterOrganic && styles.filterChipOrganic]}
        >
          <Text style={[styles.filterChipText, filterOrganic && styles.filterChipTextOrganic]}>
            🌱 Organic
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      {!loading && (
        <Text style={styles.resultsCount}>
          {totalItems === 0 ? 'No items found' : `${totalItems} items`}
        </Text>
      )}

      {/* Items grid */}
      {loading && items.length === 0 ? (
        renderSkeleton()
      ) : items.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary600}
            />
          }
          ListFooterComponent={
            loading && items.length > 0 ? (
              <ActivityIndicator color={colors.primary600} style={{ marginVertical: spacing.lg }} />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  searchRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.base,
    color: colors.gray900,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.primary100,
    borderColor: colors.primary500,
  },
  filterChipOrganic: {
    backgroundColor: colors.green100,
    borderColor: colors.primary500,
  },
  filterChipText: {
    fontSize: typography.sm,
    color: colors.gray700,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary800,
    fontWeight: '600',
  },
  filterChipTextOrganic: {
    color: colors.green700,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: typography.xs,
    color: colors.gray500,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  gridItem: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  gridLeft: {
    marginRight: spacing.xs,
  },
  gridRight: {
    marginLeft: spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.xl, fontWeight: '700', color: colors.gray700 },
  emptySubtitle: { fontSize: typography.sm, color: colors.gray500, marginTop: spacing.xs },
});

export default ShopScreen;
