import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Linking,
  Text,
  Platform,
  Keyboard,
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

const CATEGORIES: Category[] = ['Electronics', 'Books', 'Furniture', 'Other'];

export default function HomeScreen() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editWish, setEditWish] = useState<Wish | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search & Filter
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  /* 🔥 Keyboard animation value */
  const keyboardTranslateY = useSharedValue(0);

  /* -------------------- KEYBOARD HANDLING -------------------- */
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const MAX_SHIFT = 220;
        const shift = Math.min(e.endCoordinates.height - 40, MAX_SHIFT);

        keyboardTranslateY.value = withTiming(-shift, { duration: 250 });
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardTranslateY.value = withTiming(0, { duration: 250 });
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* -------------------- LOAD / SAVE -------------------- */
  useEffect(() => {
    storageService.loadWishes().then((loaded) => {
      setWishes(
        loaded.map((w) => ({
          ...w,
          isPurchased: w.isPurchased ?? false,
        }))
      );
    });
  }, []);

  useEffect(() => {
    storageService.saveWishes(wishes);
  }, [wishes]);

  /* -------------------- FILTER -------------------- */
  const filteredWishes = wishes.filter((wish) => {
    const matchesSearch = wish.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(wish.category as Category);

    return matchesSearch && matchesCategory;
  });

  /* -------------------- HANDLERS -------------------- */
  const toggleSearch = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (searchExpanded) {
      setSearchQuery('');
      setSelectedCategories([]);
    }

    setSearchExpanded((p) => !p);
  };

  const toggleCategory = async (category: Category) => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleTogglePurchase = (id: string) => {
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, isPurchased: !w.isPurchased } : w)));
  };

  const handleOpenLink = (link?: string) => {
    if (!link) return;
    const url = link.startsWith('http') ? link : `https://${link}`;
    Linking.openURL(url).catch(() => {});
  };

  /* -------------------- ANIMATION -------------------- */
  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardTranslateY.value }],
  }));

  /* -------------------- UI -------------------- */
  return (
    <View className="flex-1">
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
              onOpenLink={() => handleOpenLink(item.link)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FLOATING SEARCH + ACTIONS */}
      <Animated.View
        style={floatingStyle}
        className="absolute bottom-8 right-0 flex w-full flex-row">
        <View className="h-[100%] w-[80%] px-2">
          {searchExpanded && (
            <Animated.View
              entering={FadeIn.duration(200)}
              className="flex h-[100%] flex-col justify-between">
              <View className="flex flex-row justify-between">
                {CATEGORIES.map((category) => {
                  const selected = selectedCategories.includes(category);
                  return (
                    <Pressable
                      key={category}
                      onPress={() => toggleCategory(category)}
                      className={`rounded-full border px-4 py-2 ${
                        selected ? 'border-gray-800 bg-gray-800' : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-sm font-medium ${
                          selected ? 'text-white' : 'text-gray-700'
                        }`}>
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-auto flex flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-2">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search wishes..."
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                  className="ml-2 flex-1 text-base"
                />
              </View>
            </Animated.View>
          )}
        </View>

        <View className="flex flex-col gap-2">
          <Pressable
            onPress={toggleSearch}
            className="h-[56px] w-[56px] items-center justify-center rounded-600 bg-highlight">
            <Ionicons name={searchExpanded ? 'close' : 'search'} size={20} color="#374151" />
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              setShowAdd(true);
            }}
            className="h-[56px] w-[56px] items-center justify-center rounded-600 bg-accent">
            <Ionicons name="add" size={30} color="white" />
          </Pressable>
        </View>
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
