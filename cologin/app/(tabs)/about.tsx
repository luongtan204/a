import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { logout } from '../../store';

export default function AboutScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Họ tên: Nguyễn Văn A</Text>
      <Text style={styles.subText}>Tab Giới thiệu</Text>
      
      {user && (
        <Text style={{marginTop: 20, fontSize: 16}}>
          Xin chào, <Text style={{fontWeight: 'bold', color: 'blue'}}>{user.username}</Text>
        </Text>
      )}

      <Pressable style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }, 
  text: { fontSize: 18, fontWeight: 'bold' },
  subText: { fontSize: 14, color: 'gray', marginTop: 10 },
  btnLogout: { marginTop: 30, backgroundColor: '#FF5252', padding: 10, borderRadius: 5, width: 120, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' }
});
