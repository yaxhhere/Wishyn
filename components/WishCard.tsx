import { View, Text, Image, Pressable } from 'react-native';
import { useState } from 'react';
import { Wish } from 'types';
import { Link2, Pencil, Trash2, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react-native';
import { theme } from 'utils/theme';

interface Props {
  wish: Wish;
  onEdit: () => void;
  onDelete: () => void;
}

export default function WishCard({ wish, onEdit, onDelete }: Props) {
  // ✅ DEFAULT EXPANDED
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="mx-400 mb-300 rounded-500 bg-background-sec border-grey1 border">
      {/* Header */}
      <Pressable
        onPress={() => setExpanded((p) => !p)}
        className="px-400 py-350 flex-row items-center justify-between">
        <View className="gap-300 flex-1 flex-row items-center">
          {/* Checkbox */}
          <View className="border-grey1 rounded-200 h-5 w-5 border" />

          <Text numberOfLines={1} className="text-foreground text-400 flex-1 font-medium">
            {wish.title}
          </Text>
        </View>

        {/* Collapse / Expand icon */}
        {expanded ? (
          <ChevronUp size={18} color={theme.colors.foreground} />
        ) : (
          <ChevronDown size={18} color={theme.colors.foreground} />
        )}
      </Pressable>

      {/* Expanded content ONLY */}
      {expanded && (
        <View className="px-400 pb-400">
          {/* Image + category */}
          <View className="mb-300 flex-row items-center justify-between">
            {wish.image && (
              <Image source={{ uri: wish.image }} className="rounded-300 bg-grey1 h-20 w-20" />
            )}

            {wish.category && (
              <View className="bg-highlight px-300 py-200 rounded-full">
                <Text className="text-foreground text-200">#{wish.category.toLowerCase()}</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View className="bg-primary px-400 py-200 mb-300 self-start rounded-full">
            <Text className="text-primary-fg text-300 font-semibold">
              {wish.currency}
              {wish.price}
            </Text>
          </View>

          {/* Actions — ONLY when expanded */}
          <View className="gap-400 mt-200 flex-row justify-end">
            <Pressable>
              <Link2 size={18} color={theme.colors.foreground} />
            </Pressable>

            <Pressable onPress={onEdit}>
              <Pencil size={18} color={theme.colors.foreground} />
            </Pressable>

            <Pressable onPress={onDelete}>
              <Trash2 size={18} color={theme.colors.danger} />
            </Pressable>

            <Pressable>
              <MoreVertical size={18} color={theme.colors.foreground} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
