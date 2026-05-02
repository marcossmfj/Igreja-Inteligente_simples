import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../utils/supabase';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ members: 0, visitors: 0, schedules: 0 });

  useEffect(() => {
    async function loadStats() {
      const { count: mCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
      const { count: vCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true });
      const { count: sCount } = await supabase.from('schedules').select('*', { count: 'exact', head: true });
      
      setStats({
        members: mCount || 0,
        visitors: vCount || 0,
        schedules: sCount || 0,
      });
    }
    loadStats();
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-16">
      <View className="mb-8">
        <Text className="text-3xl font-black text-slate-900 tracking-tighter">Painel da Igreja</Text>
        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Visão Geral (Admin)</Text>
      </View>

      <View className="space-y-4 mb-8">
        <StatCard title="Membros" value={stats.members} color="bg-blue-500" />
        <StatCard title="Visitantes" value={stats.visitors} color="bg-emerald-500" />
        <StatCard title="Escalas Ativas" value={stats.schedules} color="bg-purple-500" />
      </View>

      <View className="space-y-4">
        <Text className="text-lg font-black text-slate-900 uppercase tracking-tight">Ações Rápidas</Text>
        <ActionBtn title="Gerenciar Membros" />
        <ActionBtn title="Nova Escala" />
        <ActionBtn title="Registrar Visitante" />
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-row justify-between items-center">
      <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">{title}</Text>
      <Text className="text-3xl font-black text-slate-900">{value}</Text>
    </View>
  );
}

function ActionBtn({ title }: { title: string }) {
  return (
    <TouchableOpacity className="bg-[#100E26] p-5 rounded-2xl flex-row justify-between items-center shadow-lg shadow-slate-200">
      <Text className="text-white font-bold">{title}</Text>
      <Text className="text-accent font-black">→</Text>
    </TouchableOpacity>
  );
}
