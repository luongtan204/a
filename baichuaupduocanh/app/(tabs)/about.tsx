import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Họ tên: Nguyễn Văn A</Text>
      <Text style={styles.subText}>Tab Giới thiệu</Text>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }, 
  text: { fontSize: 18, fontWeight: 'bold' },
  subText: { fontSize: 14, color: 'gray', marginTop: 10 }
});
