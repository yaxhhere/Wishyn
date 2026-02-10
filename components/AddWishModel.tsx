import { Modal, View, Text, TextInput, Pressable, Platform, Image, ScrollView } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, FadeOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { Wish, Category } from 'types';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './common/Button';
import { Currency } from 'utils/helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { useCurrency } from 'utils/context/currency';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const DEFAULT_CATEGORIES: Category[] = ['Electronics', 'Books', 'Furniture', 'Unspecified'];

const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  // { code: 'GBP', symbol: '£' },
];

const normalizeCategory = (value: string) => value.trim().toLowerCase();

const CATEGORY_STORAGE_KEY = '@wish_categories';

const CURRENCY_SYMBOL_MAP: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  // GBP: '£',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (wish: Wish) => void;
  existingWish?: Wish | null;
}

export default function AddWishModal({ visible, onClose, onSave, existingWish }: Props) {
  const isEdit = !!existingWish;

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { currency: displayCurrency } = useCurrency();
  const [category, setCategory] = useState<Category>('Unspecified');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [link, setLink] = useState('');
  const [image, setImage] = useState<string | undefined>();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [categories, setCategories] = useState<Category[]>([...DEFAULT_CATEGORIES, 'Unspecified']);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const categoryRef = useRef<View>(null);

  const [categoryAnchor, setCategoryAnchor] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);

  /* -------------------- LOAD CATEGORIES -------------------- */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const stored = await AsyncStorage.getItem(CATEGORY_STORAGE_KEY);
        if (stored) {
          setCategories(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load categories', e);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  /* -------------------- EDIT / RESET -------------------- */
  useEffect(() => {
    if (!visible) return;

    if (existingWish) {
      setTitle(existingWish.title);
      setPrice(existingWish.price.toString());
      setCategory((existingWish.category as Category) ?? 'Unspecified');
      setTargetDate(new Date(existingWish.targetDate));
      setLink(existingWish.link ?? '');
      setImage(existingWish.image);
    } else {
      reset();
    }
  }, [visible, existingWish]);

  const reset = () => {
    setTitle('');
    setPrice('');
    setCategory('Unspecified');
    setTargetDate(null);
    setLink('');
    setImage(undefined);
  };

  /* ---------------- IMAGE PICK + COMPRESS ---------------- */
  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (res.canceled) return;

    const manipulated = await ImageManipulator.manipulateAsync(
      res.assets[0].uri,
      [{ resize: { width: 512, height: 512 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    setImage(manipulated.uri);
  };

  const removeImage = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setImage(undefined);
  };

  /* ---------------- DATE PICKER ---------------- */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      Haptics.selectionAsync();
      setTargetDate(selectedDate);
    }
  };

  const openDatePicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDatePicker(true);
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = () => {
    if (!title.trim() || !price) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    onSave({
      id: existingWish?.id ?? Date.now().toString(),
      title: title.trim(),
      price: Number(price),
      currency: displayCurrency,
      targetDate: targetDate?.toISOString() ?? new Date().toISOString(),
      category,
      link: link.trim() || undefined,
      image,
      isPurchased: existingWish?.isPurchased ?? false,
    });

    onClose();
    reset();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

  return (
    <ScrollView>
      <Modal transparent animationType="none">
        <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={FadeInDown.duration(250).springify()}
              exiting={FadeOutDown.duration(200)}
              className="rounded-800 rounded-b-none bg-background p-400 shadow-2xl">
              {/* Header */}
              <View className="mb-400 flex-row items-center justify-center">
                <View className="h-1 w-12 rounded-full bg-border" />
              </View>

              <Text className="mb-400 text-center text-lg font-semibold text-gray-800">
                {isEdit ? 'Edit Wish' : 'Add Wish'}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Title Input */}
                <View className="mb-300">
                  <Text className="mb-200 text-xs font-medium text-gray-500">ITEM NAME</Text>
                  <TextInput
                    placeholder="Game Controller"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#9CA3AF"
                    className="rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
                    onFocus={() => Haptics.selectionAsync()}
                  />
                </View>

                {/* Link Input */}
                <View className="mb-300">
                  <Text className="mb-200 text-xs font-medium text-gray-500">LINK (OPTIONAL)</Text>
                  <TextInput
                    placeholder="www.label.com"
                    value={link}
                    onChangeText={setLink}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                    className="rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
                    onFocus={() => Haptics.selectionAsync()}
                  />
                </View>
                {/* Price Input */}
                <View className="mb-300 flex-1">
                  <Text className="mb-200 text-xs font-medium text-gray-500">PRICE</Text>
                  <TextInput
                    placeholder="0"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                    className="rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
                    onFocus={() => Haptics.selectionAsync()}
                  />
                </View>

                {/* Price & Currency Row */}

                {/* Image, Category & Date Section */}
                <View className="mt-300">
                  <View className="flex-row items-center gap-4">
                    {/* Column 1: Image Picker */}
                    <View className="relative h-28 w-28">
                      <Pressable
                        onPress={pickImage}
                        className="h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 border-solid border-border  bg-background-sec">
                        {image ? (
                          <Image source={{ uri: image }} className="h-full w-full" />
                        ) : (
                          <View className="items-center">
                            <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
                            <Text className="mt-1 text-xs text-gray-400">Add Image</Text>
                          </View>
                        )}
                      </Pressable>

                      {image && (
                        <Pressable
                          onPress={removeImage}
                          className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-danger shadow-lg"
                          style={{
                            elevation: 5,
                          }}>
                          <Ionicons name="close" size={16} color="white" />
                        </Pressable>
                      )}
                    </View>

                    {/* Column 2: Category & Target Date */}
                    <View className="flex-1 justify-between gap-200">
                      {/* Category Dropdown */}
                      <View className="relative">
                        <Pressable
                          ref={categoryRef}
                          onPress={() => {
                            Haptics.selectionAsync();
                            categoryRef.current?.measureInWindow((x, y, width, height) => {
                              console.log({ x, y, width, height });
                              setCategoryAnchor({
                                x,
                                y,
                                width,
                              });
                              setShowCategoryDropdown((v) => !v);
                            });
                          }}
                          className="flex-row items-center justify-between rounded-full bg-highlight px-400 py-400">
                          <Text className="text-sm font-medium text-gray-700">{category}</Text>
                          <Ionicons name="chevron-down" size={16} color="#6B7280" />
                        </Pressable>

                        {/* Category Dropdown Menu */}
                        {/* {showCategoryDropdown && (
                        <Animated.View
                          entering={FadeIn.duration(150)}
                          exiting={FadeOut.duration(100)}
                          className="absolute bottom-0 left-0 right-0 z-50 overflow-hidden rounded-600 border-2 border-border  bg-background p-400 shadow-2xl"
                          style={{ elevation: 10 }}>
                          {CATEGORIES.map((cat, idx) => (
                            <Pressable
                              key={cat}
                              onPress={() => {
                                Haptics.selectionAsync();
                                setCategory(cat);
                                setShowCategoryDropdown(false);
                              }}
                              className={`flex-row items-center justify-between px-4 py-3 ${
                                idx < CATEGORIES.length - 1 ? '' : ''
                              } ${cat === category ? 'rounded-full bg-highlight px-400 py-300' : ''}`}>
                              <Text
                                className={`text-sm ${
                                  cat === category
                                    ? 'font-semibold text-highlight-fg'
                                    : 'text-foreground'
                                }`}>
                                {cat}
                              </Text>
                              {cat === category && (
                                <Ionicons
                                  name="checkmark"
                                  size={18}
                                  color="hsl(var(--highlight-fg))"
                                />
                              )}
                            </Pressable>
                          ))}
                          <Pressable className="mt-300 flex flex-row gap-200 rounded-full bg-primary px-400 py-350">
                            <Ionicons name="add" size={18} color="hsl(0,0%,100%)" />
                            <Text className="text-primary-fg">Create New</Text>
                          </Pressable>
                        </Animated.View>
                      )} */}
                      </View>

                      {/* Target Date */}
                      <Pressable
                        onPress={openDatePicker}
                        className="flex-row items-center justify-between rounded-full  bg-highlight px-400 py-400">
                        <Text
                          className={targetDate ? 'text-sm text-foreground' : 'text-sm text-muted'}>
                          {targetDate
                            ? targetDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Target date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={targetDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </ScrollView>

              {/* Action Buttons */}
              <View className="my-400 flex flex-row items-center justify-end gap-200">
                <Button title="Cancel" variant="ghost" onPress={handleClose} />
                <Button title="Add Wish" variant="danger" onPress={handleSave} />
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* SELECT CATEGORY DROPDOWN */}
      <Modal transparent visible={showCategoryDropdown} animationType="fade">
        <Pressable className="flex-1 bg-transparent" onPress={() => setShowCategoryDropdown(false)}>
          {categoryAnchor && (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(100)}
              style={{
                position: 'absolute',
                left: categoryAnchor.x,
                top: SCREEN_HEIGHT - categoryAnchor.y + 52,
                width: categoryAnchor.width,
                backgroundColor: 'white',
                elevation: 20,
              }}
              className="overflow-hidden rounded-600 border-2 border-border p-400 shadow-2xl">
              {/* CATEGORY LIST (SCROLLABLE) */}
              <ScrollView
                style={{ maxHeight: 220 }} // 👈 max height
                showsVerticalScrollIndicator={false}>
                {categories.map((cat, idx) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                      Haptics.selectionAsync();
                    }}
                    className={`flex-row items-center justify-between px-4 py-3 ${
                      idx < categories.length - 1 ? '' : ''
                    } ${cat === category ? 'rounded-full bg-highlight px-400 py-300' : ''}`}>
                    <Text
                      className={`text-sm ${
                        cat === category ? 'font-semibold text-highlight-fg' : 'text-foreground'
                      }`}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable
                onPress={() => {
                  setShowCategoryDropdown(false);
                  setShowAddCategoryModal(true);
                }}
                className="mt-300 flex flex-row gap-200 rounded-full bg-primary px-400 py-350">
                <Ionicons name="add" size={18} color="hsl(0,0%,100%)" />
                <Text className="text-primary-fg">Create New</Text>
              </Pressable>
            </Animated.View>
          )}
        </Pressable>
      </Modal>

      {/* ADD CATEGORY MODAL */}
      <Modal transparent visible={showAddCategoryModal} animationType="none">
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowAddCategoryModal(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={FadeInDown.duration(250).springify()}
              exiting={FadeOutDown.duration(200)}
              className="rounded-800 rounded-b-none bg-background p-400 shadow-2xl">
              {/* Handle Bar */}
              <View className="mb-400 flex-row items-center justify-center">
                <View className="h-1 w-12 rounded-full bg-border" />
              </View>

              <Text className="mb-400 text-center text-lg font-semibold text-gray-800">
                Create New Category
              </Text>

              <TextInput
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="e.g. French Decor"
                placeholderTextColor="#9CA3AF"
                className="mb-5 rounded-600 border border-gray-200 bg-background-sec px-400 py-400 text-200"
                autoFocus
              />

              <View className="my-400 flex-row items-center justify-end gap-200">
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => {
                    setNewCategory('');
                    setShowAddCategoryModal(false);
                  }}
                />

                <Button
                  title="Add"
                  variant="danger"
                  onPress={() => {
                    const trimmed = newCategory.trim();

                    if (!trimmed) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      return;
                    }

                    const exists = categories.some(
                      (cat) => normalizeCategory(cat) === normalizeCategory(trimmed)
                    );

                    if (exists) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      return;
                    }

                    const finalCategory = trimmed as Category;

                    setCategories((prev) => [...prev, finalCategory]);
                    setCategory(finalCategory);

                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    setNewCategory('');
                    setShowAddCategoryModal(false);
                  }}
                />
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );

}
