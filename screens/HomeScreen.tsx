import { View, FlatList, TextInput, Pressable, Linking, Text, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, { 
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import HomeHeader from 'components/Header';
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
  
  // Search & Filter State
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const keyboardOffset = useSharedValue(0);

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
      const wishesWithDefaults = loadedWishes.map(wish => ({
        ...wish,
        isPurchased: wish.isPurchased ?? false
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
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(wish.category as Category);
    
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
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Handle wish actions
  const handleTogglePurchase = (wishId: string) => {
    setWishes((prev) =>
      prev.map((w) =>
        w.id === wishId ? { ...w, isPurchased: !(w.isPurchased ?? false) } : w
      )
    );
  };

  const handleOpenLink = (link?: string) => {
    if (link) {
      const url = link.startsWith('http') ? link : `https://${link}`;
      Linking.openURL(url).catch(err => console.log('Error opening link:', err));
    }
  };

  const animatedBottomStyle = useAnimatedStyle(() => {
    return {
      bottom: 16 + keyboardOffset.value,
    };
  });

  return (
    <View className="flex-1">
      {/* HEADER */}
      <HomeHeader />

      {/* CONTENT */}
      {filteredWishes.length === 0 ? (
        <EmptyState 
          onAdd={() => setShowAdd(true)}
        />
      ) : (
        <FlatList
          data={filteredWishes}
          keyExtractor={(item) => item.id}
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
      
      <Animated.View style={[animatedBottomStyle]} className='absolute flex flex-row w-full right-0'>
        <View className='w-[80%] px-2 h-[100%]'>
          {searchExpanded && (
            <Animated.View
                entering={FadeIn.duration(200)}
                className={'flex flex-col justify-between h-[100%]'}
              >
                <View className='flex flex-row justify-between'>
                  {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <Pressable
                  key={category}
                  onPress={() => toggleCategory(category)}
                  className={`rounded-full border px-4 py-2 ${
                    isSelected
                      ? 'border-gray-800 bg-gray-800'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
                </View>
                <View className="flex flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 mt-auto">
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
        <View className='flex flex-col gap-2 px-2'>
           <Pressable onPress={toggleSearch} className="h-14 w-14 items-center justify-center rounded-2xl bg-gray-200 flex-row gap-2">
              {searchExpanded ? <Ionicons name="close" size={20} color="#374151" /> : <Ionicons name="search" size={20} color="#374151" />}
          </Pressable>
          <Pressable
          onPress={async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (e) {
              // Haptics not available
            }
            setShowAdd(true);
          }}
          className="h-14 w-14 items-center justify-center rounded-full bg-orange-500 shadow-lg"
          style={{
            shadowColor: '#F97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
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