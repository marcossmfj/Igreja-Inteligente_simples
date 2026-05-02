import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

interface Schedule {
  id: string;
  date: string;
  event_name: string;
  status: 'pendente' | 'confirmado' | 'recusado';
  members: { name: string } | null;
  skills: { name: string } | null;
}

export default function MySchedulesScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules() {
    setLoading(true);
    // Para o MVP, pegamos as escalas recentes
    const { data, error } = await supabase
      .from('schedules')
      .select('id, date, event_name, status, members(name), skills(name)')
      .order('date', { ascending: true })
      .limit(10);

    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar as escalas.');
    } else {
      setSchedules(data as any);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('schedules')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      Alert.alert('Erro', 'Falha ao atualizar status.');
    } else {
      fetchSchedules();
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 px-6 pt-16">
      <View className="mb-8">
        <Text className="text-3xl font-black text-slate-900 tracking-tighter">Minhas Escalas</Text>
        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Próximos Compromissos</Text>
      </View>

      {schedules.length === 0 ? (
        <View className="bg-white p-8 rounded-[2rem] items-center border border-slate-100 shadow-sm">
          <Text className="text-slate-400 text-center font-medium">Nenhuma escala pendente no momento.</Text>
        </View>
      ) : (
        <View className="space-y-4 pb-24">
          {schedules.map((schedule) => (
            <View key={schedule.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-xl font-black text-slate-900 tracking-tight">{schedule.event_name}</Text>
                  <Text className="text-blue-500 font-bold text-xs uppercase tracking-widest mt-1">
                    {new Date(schedule.date).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-lg ${
                  schedule.status === 'confirmado' ? 'bg-emerald-100' :
                  schedule.status === 'recusado' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  <Text className={`text-[10px] font-black uppercase tracking-widest ${
                    schedule.status === 'confirmado' ? 'text-emerald-700' :
                    schedule.status === 'recusado' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {schedule.status}
                  </Text>
                </View>
              </View>

              <View className="bg-slate-50 p-4 rounded-2xl mb-4">
                <Text className="text-slate-500 font-medium text-sm">
                  <Text className="font-bold text-slate-700">Função: </Text>{schedule.skills?.name || 'Geral'}
                </Text>
                <Text className="text-slate-500 font-medium text-sm mt-1">
                  <Text className="font-bold text-slate-700">Membro: </Text>{schedule.members?.name}
                </Text>
              </View>

              {schedule.status === 'pendente' && (
                <View className="flex-row gap-3">
                  <TouchableOpacity 
                    className="flex-1 bg-red-50 border border-red-100 py-4 rounded-2xl items-center"
                    onPress={() => updateStatus(schedule.id, 'recusado')}
                  >
                    <Text className="text-red-600 font-black uppercase tracking-widest text-xs">Recusar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 bg-emerald-500 shadow-lg shadow-emerald-200 py-4 rounded-2xl items-center"
                    onPress={() => updateStatus(schedule.id, 'confirmado')}
                  >
                    <Text className="text-white font-black uppercase tracking-widest text-xs">Confirmar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
