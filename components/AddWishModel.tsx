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

const SCREEN_HEIGHT = Dimensions.get('window').height;

/* -------------------- CONSTANTS -------------------- */

const DEFAULT_CATEGORIES: Category[] = ['Electronics', 'Books', 'Furniture', 'Other'];

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

  /* -------------------- STATE -------------------- */
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [category, setCategory] = useState<Category>('Other');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [link, setLink] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

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

  /* -------------------- PERSIST CATEGORIES ON CHANGE -------------------- */
  useEffect(() => {
    AsyncStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  /* -------------------- EDIT / RESET -------------------- */
  useEffect(() => {
    if (!visible) return;

    if (existingWish) {
      setTitle(existingWish.title);
      setPrice(existingWish.price.toString());
      setCurrency(existingWish.currency as Currency);
      setCategory((existingWish.category as Category) ?? 'Other');
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
    setCurrency('INR');
    setCategory('Other');
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
  const handleDateChange = (_: any, selectedDate?: Date) => {
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
      currency, // ✅ currency CODE
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

  /* -------------------- UI -------------------- */
  return (
    <View>
      <Modal transparent animationType="none">
        <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={FadeInDown.duration(250).springify()}
              exiting={FadeOutDown.duration(200)}
              className="rounded-t-3xl bg-white px-6 pb-8 pt-5 shadow-2xl">
              {/* Header */}
              <View className="mb-5 flex-row items-center justify-center">
                <View className="h-1 w-12 rounded-full bg-gray-300" />
              </View>

              <Text className="mb-6 text-center text-lg font-semibold text-gray-800">
                {isEdit ? 'Edit Wish' : 'Add Wish'}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Title */}
                <View className="mb-4">
                  <Text className="mb-2 text-xs font-medium text-gray-500">ITEM NAME</Text>
                  <TextInput
                    placeholder="Snowbyt Echo Mini DAP"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#9CA3AF"
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base"
                    onFocus={() => Haptics.selectionAsync()}
                  />
                </View>

                {/* Link */}
                <View className="mb-4">
                  <Text className="mb-2 text-xs font-medium text-gray-500">LINK (OPTIONAL)</Text>
                  <TextInput
                    placeholder="www.label.com"
                    value={link}
                    onChangeText={setLink}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base"
                    onFocus={() => Haptics.selectionAsync()}
                  />
                </View>

                {/* Price & Currency */}
                <View className="mb-4 flex-row gap-3">
                  <View className="relative w-24">
                    <Text className="mb-2 text-xs font-medium text-gray-500">CURRENCY</Text>
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync();
                        setShowCurrencyDropdown((v) => !v);
                        setShowCategoryDropdown(false);
                      }}
                      className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5">
                      <Text className="text-base font-medium">{CURRENCY_SYMBOL_MAP[currency]}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </Pressable>

                    {showCurrencyDropdown && (
                      <Animated.View
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(100)}
                        className="absolute left-0 top-20 z-50 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
                        style={{ elevation: 10 }}>
                        {CURRENCIES.map(({ code, symbol }, idx) => (
                          <Pressable
                            key={code}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setCurrency(code);
                              setShowCurrencyDropdown(false);
                            }}
                            className={`flex-row items-center justify-between px-4 py-3 ${
                              idx < CURRENCIES.length - 1 ? 'border-b border-gray-100' : ''
                            } ${code === currency ? 'bg-blue-50' : ''}`}>
                            <Text
                              className={`text-base ${
                                code === currency ? 'font-semibold text-blue-600' : 'text-gray-700'
                              }`}>
                              {symbol}
                            </Text>
                            {code === currency && (
                              <Ionicons name="checkmark" size={20} color="#2563EB" />
                            )}
                          </Pressable>
                        ))}
                      </Animated.View>
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="mb-2 text-xs font-medium text-gray-500">PRICE</Text>
                    <TextInput
                      placeholder="0"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      placeholderTextColor="#9CA3AF"
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base"
                      onFocus={() => Haptics.selectionAsync()}
                    />
                  </View>
                </View>

                {/* Details */}
                <View className="mb-6">
                  <Text className="mb-2 text-xs font-medium text-gray-500">DETAILS</Text>
                  <View className="flex-row gap-4">
                    {/* Image */}
                    <View className="relative h-28 w-28">
                      <Pressable
                        onPress={pickImage}
                        className="h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
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
                          className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-red-500 shadow-lg"
                          style={{ elevation: 5 }}>
                          <Ionicons name="close" size={16} color="white" />
                        </Pressable>
                      )}
                    </View>

                    {/* Category & Date */}
                    <View className="flex-1 justify-between">
                      <View className="relative">
                        <Pressable
                          ref={categoryRef}
                          // onLayout={(e) => {
                          //   const { x, y, width } = e.nativeEvent.layout;
                          //   console.log(e.nativeEvent.layout);
                          //   setCategoryAnchor({ x, y, width });
                          // }}
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
                              setShowCurrencyDropdown(false);
                            });
                          }}
                          className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                          <Text className="text-sm font-medium text-gray-700">{category}</Text>
                          <Ionicons name="chevron-down" size={16} color="#6B7280" />
                        </Pressable>
                      </View>

                      <Pressable
                        onPress={openDatePicker}
                        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <Text
                          className={
                            targetDate ? 'text-sm text-gray-800' : 'text-sm text-gray-400'
                          }>
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

              {/* Actions */}
              <View className="mb-400 flex flex-row items-center justify-end gap-200">
                <Button title="Cancel" variant="ghost" onPress={handleClose} />
                <Button
                  title={isEdit ? 'Save Changes' : 'Add Wish'}
                  variant="danger"
                  onPress={handleSave}
                />
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CATEGORY DROPDOWN */}
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
                borderRadius: 12,
                elevation: 20,
              }}
              className="overflow-hidden border border-gray-200 shadow-2xl">
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
                    className={`px-4 py-3 ${
                      idx < categories.length - 1 ? 'border-b border-gray-100' : ''
                    } ${cat === category ? 'bg-blue-50' : ''}`}>
                    <Text
                      className={`text-sm ${
                        cat === category ? 'font-semibold text-blue-600' : 'text-gray-700'
                      }`}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* ADD CATEGORY (ALWAYS VISIBLE) */}
              <Pressable
                onPress={() => {
                  setShowCategoryDropdown(false);
                  setShowAddCategoryModal(true);
                }}
                className="flex-row items-center gap-2 border-t border-gray-100 bg-white px-4 py-3">
                <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
                <Text className="text-sm font-medium text-blue-600">Add Category</Text>
              </Pressable>
            </Animated.View>
          )}
        </Pressable>
      </Modal>

      {/* ADD CATEGORY MODAL */}
      <Modal transparent visible={showAddCategoryModal} animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setShowAddCategoryModal(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-[85%] rounded-2xl bg-white p-5">
            <Text className="mb-4 text-center text-base font-semibold text-gray-800">
              Create New Category
            </Text>

            <TextInput
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="e.g. French Decor"
              placeholderTextColor="#9CA3AF"
              className="mb-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base"
              autoFocus
            />

            <View className="flex-row justify-end gap-3">
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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
