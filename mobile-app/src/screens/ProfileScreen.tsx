import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../utils/supabase';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#100E26] px-6 justify-center items-center">
      <View className="h-24 w-24 rounded-full bg-white/10 mb-6 flex items-center justify-center">
        <Text className="text-3xl text-white">👤</Text>
      </View>
      <Text className="text-2xl font-black text-white tracking-tighter mb-8">Meu Perfil</Text>
      
      <TouchableOpacity 
        className="bg-red-500/20 px-8 py-4 rounded-2xl border border-red-500/30"
        onPress={() => supabase.auth.signOut()}
      >
        <Text className="text-red-400 font-bold uppercase tracking-widest text-xs">Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}
