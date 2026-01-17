import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { 
  FadeInDown, 
  FadeOutDown,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { Wish, Category } from 'types';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES: Category[] = ['Electronics', 'Books', 'Furniture', 'Other'];
const CURRENCIES = ['₹', '$', '€', '£', '¥'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (wish: Wish) => void;
  existingWish?: Wish | null;
}

export default function AddWishModal({
  visible,
  onClose,
  onSave,
  existingWish,
}: Props) {
  const isEdit = !!existingWish;

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [category, setCategory] = useState<Category>('Other');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [link, setLink] = useState('');
  const [image, setImage] = useState<string | undefined>();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (existingWish) {
      setTitle(existingWish.title);
      setPrice(existingWish.price.toString());
      setCurrency(existingWish.currency);
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
    setCurrency('₹');
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
      currency,
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
    <Modal transparent animationType="none">
      <Pressable 
        className="flex-1 justify-end bg-black/50" 
        onPress={handleClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={FadeInDown.duration(250).springify()}
            exiting={FadeOutDown.duration(200)}
            className="rounded-t-3xl bg-white px-6 pb-8 pt-5 shadow-2xl"
          >
            {/* Header */}
            <View className="mb-5 flex-row items-center justify-center">
              <View className="h-1 w-12 rounded-full bg-gray-300" />
            </View>

            <Text className="mb-6 text-center text-lg font-semibold text-gray-800">
              {isEdit ? 'Edit Wish' : 'Add Wish'}
            </Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title Input */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-medium text-gray-500">
                  ITEM NAME
                </Text>
                <TextInput
                  placeholder="Snowbyt Echo Mini DAP"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#9CA3AF"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base"
                  onFocus={() => Haptics.selectionAsync()}
                />
              </View>

              {/* Link Input */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-medium text-gray-500">
                  LINK (OPTIONAL)
                </Text>
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

              {/* Price & Currency Row */}
              <View className="mb-4 flex-row gap-3">
                {/* Currency Dropdown */}
                <View className="relative w-24">
                  <Text className="mb-2 text-xs font-medium text-gray-500">
                    CURRENCY
                  </Text>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setShowCurrencyDropdown((v) => !v);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5"
                  >
                    <Text className="text-base font-medium">{currency}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </Pressable>

                  {/* Currency Dropdown Menu */}
                  {showCurrencyDropdown && (
                    <Animated.View
                      entering={FadeIn.duration(150)}
                      exiting={FadeOut.duration(100)}
                      className="absolute left-0 top-20 z-50 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
                      style={{ elevation: 10 }}
                    >
                      {CURRENCIES.map((curr, idx) => (
                        <Pressable
                          key={curr}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setCurrency(curr);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`flex-row items-center justify-between px-4 py-3 ${
                            idx < CURRENCIES.length - 1 ? 'border-b border-gray-100' : ''
                          } ${curr === currency ? 'bg-blue-50' : ''}`}
                        >
                          <Text className={`text-base ${
                            curr === currency ? 'font-semibold text-blue-600' : 'text-gray-700'
                          }`}>
                            {curr}
                          </Text>
                          {curr === currency && (
                            <Ionicons name="checkmark" size={20} color="#2563EB" />
                          )}
                        </Pressable>
                      ))}
                    </Animated.View>
                  )}
                </View>

                {/* Price Input */}
                <View className="flex-1">
                  <Text className="mb-2 text-xs font-medium text-gray-500">
                    PRICE
                  </Text>
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



              {/* Image, Category & Date Section */}
              <View className="mb-6">
                <Text className="mb-2 text-xs font-medium text-gray-500">
                  DETAILS
                </Text>
                <View className="flex-row gap-4">
                  {/* Column 1: Image Picker */}
                  <View className="relative h-28 w-28">
                    <Pressable
                      onPress={pickImage}
                      className="h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50"
                    >
                      {image ? (
                        <Image
                          source={{ uri: image }}
                          className="h-full w-full"
                        />
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
                        style={{
                          elevation: 5,
                        }}
                      >
                        <Ionicons name="close" size={16} color="white" />
                      </Pressable>
                    )}
                  </View>

                  {/* Column 2: Category & Target Date */}
                  <View className="flex-1 justify-between">
                    {/* Category Dropdown */}
                    <View className="relative">
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          setShowCategoryDropdown((v) => !v);
                          setShowCurrencyDropdown(false);
                        }}
                        className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                      >
                        <Text className="text-sm font-medium text-gray-700">
                          {category}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                      </Pressable>

                      {/* Category Dropdown Menu */}
                      {showCategoryDropdown && (
                        <Animated.View
                          entering={FadeIn.duration(150)}
                          exiting={FadeOut.duration(100)}
                          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
                          style={{ elevation: 10 }}
                        >
                          {CATEGORIES.map((cat, idx) => (
                            <Pressable
                              key={cat}
                              onPress={() => {
                                Haptics.selectionAsync();
                                setCategory(cat);
                                setShowCategoryDropdown(false);
                              }}
                              className={`flex-row items-center justify-between px-4 py-3 ${
                                idx < CATEGORIES.length - 1 ? 'border-b border-gray-100' : ''
                              } ${cat === category ? 'bg-blue-50' : ''}`}
                            >
                              <Text className={`text-sm ${
                                cat === category ? 'font-semibold text-blue-600' : 'text-gray-700'
                              }`}>
                                {cat}
                              </Text>
                              {cat === category && (
                                <Ionicons name="checkmark" size={18} color="#2563EB" />
                              )}
                            </Pressable>
                          ))}
                        </Animated.View>
                      )}
                    </View>

                    {/* Target Date */}
                    <Pressable
                      onPress={openDatePicker}
                      className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <Text className={targetDate ? 'text-sm text-gray-800' : 'text-sm text-gray-400'}>
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
            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={handleClose}
                className="flex-1 items-center rounded-xl border border-gray-300 bg-white py-3.5"
              >
                <Text className="text-base font-semibold text-gray-700">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                className="flex-1 items-center rounded-xl bg-gray-900 py-3.5 shadow-md"
              >
                <Text className="text-base font-semibold text-white">
                  Save
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}