import { Modal, View, Text, TextInput, Pressable, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Wish, Category } from 'types';

const CATEGORIES: Category[] = ['Furniture', 'Electronics', 'Books', 'Other'];
const CURRENCIES = ['₹', '$', '€', '£'];

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
  const [currency, setCurrency] = useState('₹');
  const [category, setCategory] = useState<Category>('Other');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      if (existingWish) {
        setTitle(existingWish.title);
        setPrice(existingWish.price.toString());
        setCurrency(existingWish.currency);
        setCategory((existingWish.category ?? 'Other') as Category);
        setTargetDate(existingWish.targetDate ? new Date(existingWish.targetDate) : null);
      } else {
        reset();
      }
    }
  }, [visible, existingWish]);

  const reset = () => {
    setTitle('');
    setPrice('');
    setCurrency('₹');
    setCategory('Other');
    setTargetDate(null);
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!price || isNaN(Number(price))) e.price = 'Valid price required';
    if (!targetDate) e.date = 'Target date required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      id: existingWish?.id ?? Date.now().toString(),
      title: title.trim(),
      price: Number(price),
      currency,
      category,
      targetDate: targetDate!.toISOString(),
    });

    onClose();
    reset();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none">
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={FadeInDown.duration(250)}
          exiting={FadeOutDown.duration(200)}
          className="rounded-t-3xl bg-white px-5 pb-8 pt-6">
          <Text className="text-textPrimary mb-4 text-lg font-semibold">
            {isEdit ? 'Edit Wish' : 'Add New Wish'}
          </Text>

          {/* Title */}
          <TextInput
            placeholder="Wish title"
            value={title}
            onChangeText={setTitle}
            className="mb-1 rounded-xl border border-gray-200 px-4 py-3"
          />
          {errors.title && <Text className="text-danger mb-2 text-sm">{errors.title}</Text>}

          {/* Price + Currency */}
          <View className="mb-1 flex-row gap-3">
            <View className="flex-row overflow-hidden rounded-xl border border-gray-200">
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCurrency(c)}
                  className={`px-3 py-3 ${currency === c ? 'bg-primarySoft' : ''}`}>
                  <Text>{c}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3"
            />
          </View>
          {errors.price && <Text className="text-danger mb-2 text-sm">{errors.price}</Text>}

          {/* Category */}
          <View className="mb-4 mt-2 flex-row flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 ${
                  category === cat ? 'bg-primarySoft' : 'bg-gray-100'
                }`}>
                <Text>{cat}</Text>
              </Pressable>
            ))}
          </View>

          {/* Date Picker */}
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="mb-1 rounded-xl border border-gray-200 px-4 py-3">
            <Text>{targetDate ? targetDate.toDateString() : 'Select target date'}</Text>
          </Pressable>
          {errors.date && <Text className="text-danger mb-2 text-sm">{errors.date}</Text>}

          {showDatePicker && (
            <DateTimePicker
              value={targetDate ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setTargetDate(date);
              }}
            />
          )}

          {/* Actions */}
          <View className="mt-6 flex-row justify-end gap-4">
            <Pressable onPress={onClose} className="rounded-button px-6 py-3 shadow-sm">
              <Text className="text-textSecondary">Cancel</Text>
            </Pressable>

            <Pressable onPress={handleSave} className="bg-primary rounded-button px-6 py-3">
              <Text className="font-semibold text-white">{isEdit ? 'Update' : 'Save'}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
