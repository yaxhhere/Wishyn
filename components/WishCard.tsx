import { View, Text, Image, Pressable } from 'react-native';
import { useState } from 'react';
import { Wish } from 'types';
import { Link2, Pencil, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react-native';
import { theme } from 'utils/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
interface Props {
  wish: Wish;
  onEdit: () => void;
  onDelete: () => void;
}

export default function WishCard({ wish, onEdit, onDelete }: Props) {
  //  DEFAULT EXPANDED
  const [expanded, setExpanded] = useState(true);

  return (
    <View className="rounded-700 mx-400 mb-300 border border-grey1 bg-background">
      {/* Header */}
      <Pressable
        onPress={() => setExpanded((p) => !p)}
        className="flex-row items-center justify-between px-400 py-350">
        <View className="flex-1 flex-row items-center gap-300">
          {/* Checkbox */}
          <View className="h-5 w-5 rounded-200 border border-grey1" />

          <Text numberOfLines={1} className="flex-1 text-400 font-medium text-foreground">
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
              <Image source={{ uri: wish.image }} className="h-20 w-20 rounded-300 bg-grey1" />
            )}

            {wish.category && (
              <View className="rounded-full bg-highlight px-300 py-200">
                <Text className="text-200 text-foreground">#{wish.category.toLowerCase()}</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View className="mb-300 self-start rounded-full bg-primary px-400 py-200">
            <Text className="text-300 font-semibold text-primary-fg">
              {wish.currency}
              {wish.price}
            </Text>
          </View>

          {/* Actions — ONLY when expanded */}
          <View className="mt-200 flex-row justify-end gap-400">
            <Pressable>
              <Link2 size={18} color={theme.colors.foreground} />
            </Pressable>

            <Pressable onPress={onEdit}>
              <Pencil size={18} color={theme.colors.foreground} />
            </Pressable>

            <Pressable onPress={onDelete}>
              {/* <Trash2 size={18} color={theme.colors.danger} /> */}
              <MaterialDesignIcons name="delete" size={20} color={theme.colors.danger} />
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
