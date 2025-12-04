import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = 'https://67ff3c6458f18d7209f06c43.mockapi.io/chitieu';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    if (password !== confirmPassword) return Alert.alert('Lỗi', 'Mật khẩu không khớp');
    
    setLoading(true);
    try {
      // Check if user exists
      const checkRes = await fetch(API_URL);
      const users = await checkRes.json();
      if (users.some((u: any) => u.username === username)) {
        Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại');
        setLoading(false);
        return;
      }

      // Create user
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        Alert.alert('Thành công', 'Đăng ký thành công');
        router.back();
      } else {
        Alert.alert('Lỗi', 'Đăng ký thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ĐĂNG KÝ</Text>
      
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
      <TextInput 
        style={styles.input} 
        placeholder="Nhập lại mật khẩu" 
        value={confirmPassword} 
        onChangeText={setConfirmPassword} 
        secureTextEntry 
      />
      
      {loading ? <ActivityIndicator size="large" color="blue" /> : (
        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </Pressable>
      )}

      <Pressable onPress={() => router.back()} style={{marginTop: 20}}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#2196F3', textAlign: 'center', fontSize: 16 }
});
