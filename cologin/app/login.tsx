import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { login } from '../store';

const API_URL = 'https://67ff3c6458f18d7209f06c43.mockapi.io/chitieu';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const users = await res.json();
      const user = users.find((u: any) => u.username === username && u.password === password);
      
      if (user) {
        dispatch(login(user));
        Alert.alert('Thành công', 'Đăng nhập thành công');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Lỗi', 'Sai tên đăng nhập hoặc mật khẩu');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ĐĂNG NHẬP</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Tên đăng nhập" 
        value={username} 
        onChangeText={setUsername} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Mật khẩu" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      {loading ? <ActivityIndicator size="large" color="blue" /> : (
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </Pressable>
      )}

      <Pressable onPress={() => router.push('/register')} style={{marginTop: 20}}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#2196F3', textAlign: 'center', fontSize: 16 }
});
