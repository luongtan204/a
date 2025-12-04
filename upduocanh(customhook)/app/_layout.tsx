import React from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Nhóm Tabs (Màn hình chính) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Màn hình Detail (Stack đè lên Tabs) */}
        <Stack.Screen 
          name="detail/[id]" 
          options={{ 
            title: 'Chi tiết món',
            headerShown: true, // Hiện header để có nút Back
            headerBackTitle: 'Quay lại' 
          }} 
        />
      </Stack>
    </Provider>
  );
}

