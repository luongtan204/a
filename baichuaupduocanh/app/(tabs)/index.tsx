import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, Text, FlatList, Image, TextInput, Pressable, 
  Modal, Switch, ActivityIndicator, StyleSheet, Alert, Platform, SafeAreaView, TouchableOpacity
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router'; // Import router
import { setDrinks, addDrink, updateDrink, deleteDrink } from '../../store'; // Lưu ý đường dẫn ../../store

const API_URL = '[https://656xxxxx.mockapi.io/drinks](https://656xxxxx.mockapi.io/drinks)';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const drinks = useSelector(state => state.drinks.items);
  const router = useRouter(); // Hook điều hướng

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editId, setEditId] = useState(null);
  const nameInputRef = useRef(null);

  // --- FETCH DATA ---
  useEffect(() => {
    setLoading(true);
    fetch(API_URL).then(res => res.json()).then(data => {
        dispatch(setDrinks(data)); setLoading(false);
    }).catch(err => setLoading(false));
  }, []);

  // --- LOGIC CRUD (Giữ nguyên) ---
  const handleToggle = useCallback((item) => {
    const newStatus = !item.isAvailable;
    fetch(`${API_URL}/${item.id}`, {
      method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ isAvailable: newStatus })
    }).then(() => dispatch(updateDrink({ id: item.id, isAvailable: newStatus })));
  }, [dispatch]);

  const handleDelete = (item) => {
    const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';
    const confirmDelete = () => {
        setLoading(true);
        fetch(`${API_URL}/${item.id}`, { method: 'DELETE' })
          .then(() => { dispatch(deleteDrink(item.id)); setLoading(false); })
          .catch(() => { alert("Lỗi xóa"); setLoading(false); });
    };
    if (isWeb) { if (window.confirm(`Xóa món "${item.name}"?`)) confirmDelete(); }
    else { Alert.alert("Xác nhận", `Xóa món "${item.name}"?`, [{ text: "Hủy" }, { text: "Xóa", onPress: confirmDelete }]); }
  };

  const handleSave = () => {
    if (!name || !price) return alert("Nhập đủ thông tin");
    const payload = { name, price: Number(price), image: '[https://via.placeholder.com/150](https://via.placeholder.com/150)' };
    setLoading(true);
    if (editId) {
      fetch(`${API_URL}/${editId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
      .then(res => res.json()).then(data => { dispatch(updateDrink(data)); setModalVisible(false); setLoading(false); });
    } else {
      payload.isAvailable = true;
      fetch(API_URL, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) })
      .then(res => res.json()).then(data => { dispatch(addDrink(data)); setModalVisible(false); setLoading(false); });
    }
  };

  const openEdit = (item) => { setEditId(item.id); setName(item.name); setPrice(item.price.toString()); setModalVisible(true); };
  const openAdd = () => { setEditId(null); setName(''); setPrice(''); setModalVisible(true); };

  // --- RENDER ---
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* Bấm vào Ảnh để sang trang Detail */}
      <TouchableOpacity onPress={() => router.push(`/detail/${item.id}`)}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{Number(item.price).toLocaleString()} đ</Text>
        <View style={styles.actionRow}>
            <Pressable style={styles.btnEdit} onPress={() => openEdit(item)}><Text style={styles.btnText}>Sửa</Text></Pressable>
            <Pressable style={styles.btnDelete} onPress={() => handleDelete(item)}><Text style={styles.btnText}>Xóa</Text></Pressable>
        </View>
      </View>
      <Switch value={item.isAvailable} onValueChange={() => handleToggle(item)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList data={drinks} keyExtractor={item => item.id} renderItem={renderItem} />
      )}
      <Pressable style={styles.fab} onPress={openAdd}><Text style={styles.fabText}>+</Text></Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <TextInput style={styles.input} placeholder="Tên" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Giá" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <View style={{flexDirection:'row', gap:10}}>
                <Pressable style={[styles.btn, {backgroundColor:'gray'}]} onPress={()=>setModalVisible(false)}><Text>Hủy</Text></Pressable>
                <Pressable style={[styles.btn, {backgroundColor:'blue'}]} onPress={handleSave}><Text style={{color:'white'}}>Lưu</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 30 },
  itemContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 10, margin: 10, borderRadius: 8, alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 30, marginRight: 15, backgroundColor: '#eee' },
  infoContainer: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemPrice: { color: 'green' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  btnEdit: { backgroundColor: '#FFC107', padding: 5, borderRadius: 4 },
  btnDelete: { backgroundColor: '#FF5252', padding: 5, borderRadius: 4 },
  btnText: { fontSize: 12, color: 'white' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'blue', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: 'white', fontSize: 30 },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  btn: { padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' }
});
