import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Image, TextInput, Pressable, Modal, Switch, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDrinks } from '../../hooks/useDrinks';
import { useImageUpload } from '../../hooks/useImageUpload';

export default function HomeScreen() {
  const router = useRouter();
  const { drinks, loading, totalValue, handleToggle, handleDelete, handleSave } = useDrinks();
  const { uploading, pickImage, uploadWithLoading } = useImageUpload();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', price: '', image: '' });
  const nameInputRef = useRef<TextInput>(null);

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) setForm(prev => ({ ...prev, image: uri }));
  };

  const onSave = async () => {
    if (!form.name || !form.price) return alert("Thiếu thông tin!");
    
    const imageUrl = await uploadWithLoading(form.image);
    await handleSave(form, imageUrl);
    setModalVisible(false);
  };

  // --- RENDER ---
  const openModal = (item: any = null) => {
    setForm(item ? { ...item, price: item.price.toString() } : { id: null, name: '', price: '', image: '' });
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => router.push(`/detail/${item.id}`)}>
        <Image source={{ uri: item.image }} style={styles.thumb} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{Number(item.price).toLocaleString()} đ</Text>
        <View style={styles.btnRow}>
          <Pressable style={[styles.btn, { backgroundColor: '#FFC107' }]} onPress={() => openModal(item)}><Text>Sửa</Text></Pressable>
          <Pressable style={[styles.btn, { backgroundColor: '#FF5252' }]} onPress={() => handleDelete(item)}><Text style={{color:'#fff'}}>Xóa</Text></Pressable>
        </View>
      </View>
      <Switch value={item.isAvailable} onValueChange={() => handleToggle(item)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={{fontWeight:'bold'}}>Tổng Menu: {totalValue.toLocaleString()} đ</Text></View>
      {loading && <ActivityIndicator size="large" />}
      <FlatList data={drinks} keyExtractor={item => item.id} renderItem={renderItem} />
      <Pressable style={styles.fab} onPress={() => openModal()}><Text style={styles.fabText}>+</Text></Pressable>

      <Modal visible={modalVisible} transparent animationType="slide" onShow={() => setTimeout(() => nameInputRef.current?.focus(), 100)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {form.image ? <Image source={{ uri: form.image }} style={styles.preview} /> : null}
            <Pressable style={styles.btnPick} onPress={handlePickImage}><Text style={{color:'white'}}>📷 Chọn ảnh</Text></Pressable>
            <TextInput ref={nameInputRef} style={styles.input} placeholder="Tên món" value={form.name} onChangeText={t => setForm({...form, name: t})} />
            <TextInput style={styles.input} placeholder="Giá" value={form.price} onChangeText={t => setForm({...form, price: t})} keyboardType="numeric" />
            <Pressable style={[styles.btnSave, { opacity: uploading ? 0.5 : 1 }]} onPress={onSave} disabled={uploading}>
              <Text style={{color:'white'}}>{uploading ? 'Đang tải...' : 'LƯU'}</Text>
            </Pressable>
            <Pressable style={{marginTop:15, alignSelf:'center'}} onPress={() => setModalVisible(false)}><Text>Đóng</Text></Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  header: { padding: 15, backgroundColor: '#e3f2fd', borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 10, marginBottom: 10, borderRadius: 8, alignItems: 'center', elevation: 2 },
  thumb: { width: 60, height: 60, borderRadius: 8, marginRight: 10, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { color: 'green' },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  btn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'blue', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: 'white', fontSize: 30, marginTop: -3 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  preview: { width: 80, height: 80, borderRadius: 8, alignSelf: 'center', marginBottom: 10 },
  btnPick: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },
  btnSave: { backgroundColor: 'blue', padding: 12, borderRadius: 5, alignItems: 'center' }
});