import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Linking,
  Text,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useEffect, useState } from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import WishCard from 'components/WishCard';
import EmptyState from 'components/EmptyState';
import AddWishModal from 'components/AddWishModel';
import ConfirmDeleteModal from 'components/ConfirmDeleteModal';

import { Wish, Category } from 'types';
import { storageService } from 'utils/storage';
import { useCurrency } from 'utils/context/currency';
import { formatCurrency } from 'utils/helper';
import { useCategories } from 'utils/context/category';

export default function WishesScreen() {
  const { categories } = useCategories();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editWish, setEditWish] = useState<Wish | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search & Filter State
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const keyboardOffset = useSharedValue(0);
  const { currency: displayCurrency } = useCurrency();
  const totalRemaining = wishes
    .filter((w) => !w.isPurchased)
    .reduce((sum, w) => sum + (Number(w.price) || 0), 0);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        keyboardOffset.value = withTiming(e.endCoordinates.height, { duration: 250 });
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardOffset.value = withTiming(0, { duration: 250 });
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    storageService.loadWishes().then((loadedWishes) => {
      // Ensure all wishes have isPurchased property
      const wishesWithDefaults = loadedWishes.map((wish) => ({
        ...wish,
        isPurchased: wish.isPurchased ?? false,
      }));
      setWishes(wishesWithDefaults);
    });
  }, []);

  useEffect(() => {
    storageService.saveWishes(wishes);
  }, [wishes]);

  // Filter wishes based on search and categories
  const filteredWishes = wishes.filter((wish) => {
    const matchesSearch = wish.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(wish.category as Category);

    return matchesSearch && matchesCategory;
  });

  // Toggle search expansion
  const toggleSearch = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics not available
    }

    if (searchExpanded) {
      // Collapse
      setSearchQuery('');
      setSelectedCategories([]);
    } else {
      // Expand - do nothing, just state change
    }

    setSearchExpanded(!searchExpanded);
  };

  // Toggle category filter
  const toggleCategory = async (category: Category) => {
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Haptics not available
    }
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Handle wish actions
  const handleTogglePurchase = (wishId: string) => {
    setWishes((prev) =>
      prev.map((w) => (w.id === wishId ? { ...w, isPurchased: !(w.isPurchased ?? false) } : w))
    );
  };

  const handleOpenLink = (link?: string) => {
    if (link) {
      const url = link.startsWith('http') ? link : `https://${link}`;
      Linking.openURL(url).catch((err) => console.log('Error opening link:', err));
    }
  };

  const animatedBottomStyle = useAnimatedStyle(() => {
    const isKeyboardOpen = keyboardOffset.value > 0;

    if (searchExpanded && isKeyboardOpen) {
      return { bottom: keyboardOffset.value - 64 };
    }

    if (searchExpanded && !isKeyboardOpen) {
      return { bottom: 32 };
    }

    // search closed + keyboard closed
    return { bottom: 32 };
  });

  return (
    <View className="flex-1">
      {/* HEADER */}

      {/* CONTENT */}
      {filteredWishes.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <FlatList
          data={filteredWishes}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-300" />}
          renderItem={({ item }) => (
            <WishCard
              wish={item}
              onEdit={() => {
                setEditWish(item);
                setShowAdd(true);
              }}
              onDelete={() => setDeleteId(item.id)}
              onTogglePurchase={() => handleTogglePurchase(item.id)}
              onOpenLink={() => handleOpenLink(item.link || '')}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Animated.View
        pointerEvents="box-none"
        style={animatedBottomStyle}
        className="absolute w-full px-4">
        <Animated.View
          pointerEvents="box-none"
          entering={FadeIn.duration(200)}
          className={
            searchExpanded === true
              ? 'w-full flex-col items-center justify-end rounded-600 border border-border bg-grey1 p-300'
              : 'w-full flex-col items-center justify-end'
          }>
          {/* Categories */}
          {searchExpanded && (
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 6,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category);

                return (
                  <Pressable
                    key={category}
                    onPress={() => toggleCategory(category)}
                    className={`h-[32px] justify-center rounded-full border px-4 ${
                      isSelected ? 'border-0 bg-primary' : 'border-border-dark bg-background-sec'
                    }`}>
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? 'text-white' : 'text-foreground'
                      }`}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Animated.View
            pointerEvents="box-none"
            entering={FadeIn.duration(200)}
            className="mt-200 w-full flex-row items-center justify-end">
            {/* LEFT SIDE */}
            {searchExpanded && (
              <>
                <View className="mr-3 flex-1">
                  {/* Search Input */}
                  <View className="mt-2 w-full flex-row items-center rounded-600 border border-border bg-background px-4 py-2">
                    <Ionicons name="search" size={20} color="#9CA3AF" />

                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search wishes..."
                      placeholderTextColor="#9CA3AF"
                      autoFocus
                      className="ml-2 w-full flex-1 text-base"
                    />
                  </View>
                </View>
              </>
            )}

            {/* RIGHT BUTTON COLUMN */}
            <View
              className={
                searchExpanded
                  ? ' flex-row items-end justify-between gap-3'
                  : 'flex-1 flex-row items-end justify-between gap-3'
              }>
              {/* TOTAL VIEW */}
              {!searchExpanded && (
                <View className="flex h-800 flex-col items-start justify-start  rounded-full border border-border bg-highlight px-600 py-300">
                  <Text className="text-xs text-highlight-fg">Total</Text>
                  <Text className="text-lg font-semibold text-highlight-fg">
                    {totalRemaining > 0 ? formatCurrency(totalRemaining, displayCurrency) : 0}
                  </Text>
                </View>
              )}

              {/* BUTTON COLUMN */}
              <View className="w-[64px] items-center gap-2">
                {/* SEARCH / CLOSE BUTTON */}
                <Pressable
                  onPress={toggleSearch}
                  className={`items-center justify-center 
        ${
          searchExpanded
            ? 'h-800 w-800 rounded-600 bg-accent'
            : 'h-750 w-750 rounded-2xl bg-highlight'
        }
      `}>
                  <Ionicons
                    name={searchExpanded ? 'close' : 'search'}
                    size={searchExpanded ? 24 : 20}
                    color={searchExpanded ? 'white' : '#374151'}
                  />
                </Pressable>

                {/* ADD BUTTON */}
                {!searchExpanded && (
                  <Pressable
                    onPress={async () => {
                      try {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      } catch {}
                      setShowAdd(true);
                    }}
                    className="h-800 w-800 items-center justify-center rounded-600 bg-accent">
                    <Ionicons name="add" size={32} color="white" />
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* MODALS */}
      <AddWishModal
        visible={showAdd}
        existingWish={editWish}
        onSave={(wish) => {
          setWishes((prev) =>
            prev.some((w) => w.id === wish.id)
              ? prev.map((w) => (w.id === wish.id ? wish : w))
              : [...prev, wish]
          );
        }}
        onClose={() => {
          setShowAdd(false);
          setEditWish(null);
        }}
      />

      <ConfirmDeleteModal
        visible={!!deleteId}
        onConfirm={() => {
          setWishes((prev) => prev.filter((w) => w.id !== deleteId));
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
