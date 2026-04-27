'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSchedule(formData: FormData) {
  try {
    const date = formData.get('date') as string
    const skill_id = formData.get('skill_id') as string
    const member_id = formData.get('member_id') as string

    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Erro de autenticação:', authError?.message)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.church_id) {
      console.error('Erro ao buscar perfil ou igreja não vinculada:', profileError?.message)
      return
    }

    const { error } = await supabase.from('schedules').insert({ 
      date, 
      skill_id: skill_id || null, 
      member_id, 
      church_id: profile.church_id 
    })
    
    if (error) console.error('Erro ao inserir escala:', error.message)

    revalidatePath('/schedules')
  } catch (err) {
    console.error('Erro crítico na action addSchedule:', err)
  }
}

export async function deleteSchedule(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) console.error('Erro ao deletar escala:', error.message)
    revalidatePath('/schedules')
  } catch (err) {
    console.error('Erro crítico na action deleteSchedule:', err)
  }
}
