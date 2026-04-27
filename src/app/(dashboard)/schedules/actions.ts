'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addSchedule(formData: FormData) {
  try {
    const date = formData.get('date') as string
    const skill_id = formData.get('skill_id') as string
    const member_id = formData.get('member_id') as string

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Usuário não autenticado.' }
    }

    // Usar Admin para evitar o erro 500 de recursividade do RLS na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.church_id) {
      return { error: 'Seu usuário não está vinculado a nenhuma igreja. Verifique o Painel Master.' }
    }

    const { error } = await supabase.from('schedules').insert({ 
      date, 
      skill_id: skill_id || null, 
      member_id, 
      church_id: profile.church_id 
    })
    
    if (error) {
      return { error: 'Erro ao inserir escala: ' + (error?.message || 'Erro desconhecido') }
    }

    revalidatePath('/schedules')
    return { success: true }
  } catch (err: any) {
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function deleteSchedule(id: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar escala:', error.message)
      return
    }
    revalidatePath('/schedules')
  } catch (err: any) {
    console.error('Erro inesperado ao deletar escala:', err?.message || 'Erro desconhecido')
  }
}
