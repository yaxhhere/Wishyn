import { View, Text, Image, Pressable } from 'react-native';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Wish } from 'types';
import { Currency, convertCurrency, formatCurrency } from 'utils/helper';
import { useCurrency } from 'utils/context/currency';

interface Props {
  wish: Wish;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePurchase: () => void;
  onOpenLink: () => void;
}

export default function WishCard({ wish, onEdit, onDelete, onTogglePurchase, onOpenLink }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { currency: displayCurrency } = useCurrency();

  if (!wish) return null;

  const isPurchased = Boolean(wish.isPurchased);
  const wishCurrency = (wish.currency || 'INR') as Currency;

  /* -------------------- Price Parsing -------------------- */
  const wishPrice = useMemo(() => {
    const raw = wish.price ?? 0;
    const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^\d.-]/g, ''));

    return isNaN(num) ? 0 : num;
  }, [wish.price]);

  const displayPrice = useMemo(() => {
    return convertCurrency(wishPrice, wishCurrency, displayCurrency);
  }, [wishPrice, wishCurrency, displayCurrency]);

  /* -------------------- Haptics -------------------- */
  const hapticLight = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const hapticMedium = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  /* -------------------- Handlers -------------------- */
  const toggleExpand = async () => {
    await hapticLight();
    setExpanded((p) => !p);
  };

  const handleCheckbox = async () => {
    await hapticMedium();
    onTogglePurchase();
  };

  /* -------------------- UI -------------------- */
  return (
    <View className="mx-4 overflow-hidden rounded-800 border border-gray-200 bg-white shadow-lg">
      <View className="px-400 py-300">
        {/* Header */}
        <View className="mb-2 flex-row items-center">
          <Pressable onPress={handleCheckbox} className="mr-3">
            <View
              className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                isPurchased ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'
              }`}>
              {isPurchased && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </Pressable>

          <Pressable onPress={toggleExpand} className="flex-1">
            <Text
              numberOfLines={1}
              className={`text-[18px] font-bold ${
                isPurchased ? 'text-gray-400 line-through' : 'text-gray-800'
              }`}>
              {wish.title}
            </Text>
          </Pressable>

          <Pressable onPress={toggleExpand} className="ml-3">
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* Expanded */}
        {expanded && (
          <View className="mb-3">
            <View className="flex-row items-center justify-between">
              {wish.image ? (
                <Image
                  source={{ uri: wish.image }}
                  className="h-24 w-24 rounded-600 bg-muted"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-600 border-2 border-border">
                  <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                </View>
              )}

              {wish.category && wish.category.toLowerCase() !== 'other' && (
                <View className="rounded-full bg-highlight px-400 py-300">
                  <Text className="text-200 text-foreground">{wish.category}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Price */}
        <View className="gap-2">
          <View className="self-start rounded-full bg-teal-600 px-5 py-2">
            <Text className="text-lg font-semibold text-white">
              {formatCurrency(displayPrice, displayCurrency)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row items-center justify-end gap-4 py-2">
          {wish.link && (
            <Pressable
              onPress={async () => {
                await hapticLight();
                onOpenLink();
              }}>
              <Ionicons name="link" size={22} color="#374151" />
            </Pressable>
          )}

          <Pressable
            onPress={async () => {
              await hapticLight();
              onEdit();
            }}>
            <Ionicons name="pencil" size={20} color="#374151" />
          </Pressable>

          <Pressable
            onPress={async () => {
              await hapticLight();
              onDelete();
            }}>
            <Ionicons name="trash" size={22} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
