import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Image, TextInput, Pressable, Modal, Switch, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { setDrinks, addDrink, updateDrink, deleteDrink } from '../../store';

const API = 'https://67ff3c6458f18d7209f06c43.mockapi.io/onthi';
const CLOUD_URL = 'https://api.cloudinary.com/v1_1/dnkxuaai5/image/upload';
const PRESET = 'test_api';

// --- HELPER: GỘP CHUNG CALL API ---
const apiCall = async (url: string, method: string = 'GET', body: any = null) => {
  const options: any = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  return fetch(url, options).then(res => res.json());
};

export default function HomeScreen() {
  const dispatch = useDispatch();
  const drinks = useSelector((state: any) => state.drinks.items);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', price: '', image: '' });
  const nameInputRef = useRef<TextInput>(null);

  // 1. Load Data
  useEffect(() => {
    setLoading(true);
    apiCall(API).then(data => { dispatch(setDrinks(data)); setLoading(false); });
  }, []);

  // 2. Tính tổng (useMemo)
  const totalValue = useMemo(() => drinks.reduce((sum: number, item: any) => item.isAvailable ? sum + Number(item.price) : sum, 0), [drinks]);

  // 3. Upload Ảnh (Web Only)
  const uploadImage = async (uri: string) => {
    if (!uri || uri.startsWith('http')) return uri;
    try {
      const formData = new FormData();
      formData.append('upload_preset', PRESET);
      formData.append('file', await fetch(uri).then(r => r.blob())); // Blob cho Web
      const res = await fetch(CLOUD_URL, { method: 'POST', body: formData });
      const data = await res.json();
      return res.ok ? data.secure_url : null;
    } catch { return null; }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!res.canceled) setForm(prev => ({ ...prev, image: res.assets[0].uri }));
  };

  // --- ACTIONS: SỬ DỤNG HÀM `apiCall` CHO GỌN ---
  
  const handleToggle = useCallback((item: any) => {
    dispatch(updateDrink({ ...item, isAvailable: !item.isAvailable })); // UI First
    apiCall(`${API}/${item.id}`, 'PUT', { isAvailable: !item.isAvailable });
  }, [dispatch]);

  const handleDelete = useCallback((item: any) => {
    if (window.confirm(`Xóa "${item.name}"?`)) {
      setLoading(true);
      apiCall(`${API}/${item.id}`, 'DELETE').then(() => {
        dispatch(deleteDrink(item.id)); setLoading(false);
      });
    }
  }, [dispatch]);

  const handleSave = async () => {
    if (!form.name || !form.price) return alert("Thiếu thông tin!");
    
    setUploading(true);
    const img = await uploadImage(form.image) || 'https://via.placeholder.com/150';
    setUploading(false);

    const payload = { ...form, price: Number(form.price), image: img };
    const isEdit = !!form.id;
    
    setLoading(true);
    // Logic gọi API gom gọn vào 1 dòng
    apiCall(isEdit ? `${API}/${form.id}` : API, isEdit ? 'PUT' : 'POST', payload)
      .then(data => {
        dispatch(isEdit ? updateDrink(data) : addDrink(data));
        setModalVisible(false); setLoading(false);
      });
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
            <Pressable style={styles.btnPick} onPress={pickImage}><Text style={{color:'white'}}>📷 Chọn ảnh</Text></Pressable>
            <TextInput ref={nameInputRef} style={styles.input} placeholder="Tên món" value={form.name} onChangeText={t => setForm({...form, name: t})} />
            <TextInput style={styles.input} placeholder="Giá" value={form.price} onChangeText={t => setForm({...form, price: t})} keyboardType="numeric" />
            <Pressable style={[styles.btnSave, { opacity: uploading ? 0.5 : 1 }]} onPress={handleSave} disabled={uploading}>
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