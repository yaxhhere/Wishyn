import { View, FlatList } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

import HomeHeader from 'components/Header';
import HomeFooter from 'components/Footer';
import WishCard from 'components/WishCard';
import EmptyState from 'components/EmptyState';
import AddWishModal from 'components/AddWishModel';
import ConfirmDeleteModal from 'components/ConfirmDeleteModal';

import { Wish } from 'types';
import { storageService } from 'utils/storage';

export default function HomeScreen() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editWish, setEditWish] = useState<Wish | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    storageService.loadWishes().then(setWishes);
  }, []);

  useEffect(() => {
    storageService.saveWishes(wishes);
  }, [wishes]);

  const total = useMemo(() => wishes.reduce((sum, w) => sum + w.price, 0), [wishes]);

  return (
    <View className="bg-background flex-1">
      {/* HEADER */}
      <HomeHeader />

      {/* CONTENT */}
      {wishes.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <FlatList
          data={wishes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WishCard
              wish={item}
              onEdit={() => {
                setEditWish(item);
                setShowAdd(true);
              }}
              onDelete={() => setDeleteId(item.id)}
            />
          )}
          ListFooterComponent={
            // space for footer + bottom nav
            <View className="h-[160px]" />
          }
        />
      )}

      {/* FOOTER */}
      <HomeFooter total={total} onAdd={() => setShowAdd(true)} />

      {/* MODALS */}
      <AddWishModal
        visible={showAdd}
        existingWish={editWish}
        onSave={(wish) =>
          setWishes((prev) =>
            prev.some((w) => w.id === wish.id)
              ? prev.map((w) => (w.id === wish.id ? wish : w))
              : [...prev, wish]
          )
        }
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
