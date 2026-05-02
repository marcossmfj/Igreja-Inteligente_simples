import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../utils/supabase';

import DashboardScreen from '../screens/DashboardScreen';
import MySchedulesScreen from '../screens/MySchedulesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(data?.role || 'user');
      }
      setLoading(false);
    }
    fetchRole();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  const isAdmin = role === 'admin' || role === 'master';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#100E26',
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
      }}
    >
      {isAdmin ? (
        <>
          <Tab.Screen name="Gestão" component={DashboardScreen} />
          {/* Outras abas de admin serão adicionadas aqui */}
          <Tab.Screen name="Perfil" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Minhas Escalas" component={MySchedulesScreen} />
          <Tab.Screen name="Perfil" component={ProfileScreen} />
        </>
      )}
    </Tab.Navigator>
  );
}
