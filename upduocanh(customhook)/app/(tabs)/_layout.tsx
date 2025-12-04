import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: 'blue',
      tabBarInactiveTintColor: 'gray',
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Menu',
          tabBarIcon: ({ color }) => <Ionicons name="cafe" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="about" 
        options={{ 
          title: 'Giới thiệu',
          tabBarIcon: ({ color }) => <Ionicons name="information-circle" size={24} color={color} />
        }} 
      />
    </Tabs>
  );
}
