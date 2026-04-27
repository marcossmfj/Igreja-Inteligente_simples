'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addSchedule(formData: FormData) {
  const date = formData.get('date') as string
  const skill_id = formData.get('skill_id') as string
  const member_id = formData.get('member_id') as string

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('church_id')
    .eq('id', user.id)
    .single()

  if (!profile?.church_id) {
    console.error('Usuário sem igreja vinculada')
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
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient()
  await supabase.from('schedules').delete().eq('id', id)
  revalidatePath('/schedules')
}
