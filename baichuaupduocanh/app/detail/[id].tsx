import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  // Lấy dữ liệu trực tiếp từ Redux store dựa trên ID (nhanh hơn gọi API lại)
  const item = useSelector((state: any) => state.drinks.items.find((i: any) => i.id === id));

  if (!item) return <View style={styles.center}><Text>Không tìm thấy sản phẩm</Text></View>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.price}>{Number(item.price).toLocaleString()} VNĐ</Text>
      <Text style={styles.status}>
        Trạng thái: {item.isAvailable ? "Đang bán" : "Hết hàng"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  price: { fontSize: 20, color: 'green', marginBottom: 10 },
  status: { fontSize: 16, color: 'gray' }
});
