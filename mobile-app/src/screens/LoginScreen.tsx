import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Erro ao entrar', error.message);
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-primary px-8 justify-center">
      <View className="items-center mb-12">
        <Text className="text-white text-3xl font-black uppercase tracking-tighter">
          Igreja<Text className="text-accent">Inteligente</Text>
        </Text>
        <Text className="text-white/50 font-bold mt-2 uppercase tracking-widest text-xs">
          Acesso Restrito
        </Text>
      </View>

      <View className="space-y-4">
        <TextInput
          className="bg-white/10 text-white px-5 py-4 rounded-2xl border border-white/5 font-medium"
          placeholder="Seu E-mail"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className="bg-white/10 text-white px-5 py-4 rounded-2xl border border-white/5 font-medium"
          placeholder="Sua Senha"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          className="bg-accent rounded-2xl py-4 mt-4 shadow-lg shadow-accent/30 flex-row justify-center items-center"
          onPress={signInWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-center font-black uppercase tracking-widest">
              Entrar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
