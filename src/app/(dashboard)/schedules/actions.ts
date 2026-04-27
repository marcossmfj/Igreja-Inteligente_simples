'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSchedule(formData: FormData) {
  const date = formData.get('date') as string
  const skill_id = formData.get('skill_id') as string
  const member_id = formData.get('member_id') as string

  const supabase = await createClient()
  
  const { data: profile } = await supabase.from('profiles').select('church_id').single()
  if (!profile?.church_id) return

  await supabase.from('schedules').insert({ 
    date, 
    skill_id: skill_id || null, 
    member_id, 
    church_id: profile.church_id 
  })
  revalidatePath('/schedules')
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient()
  await supabase.from('schedules').delete().eq('id', id)
  revalidatePath('/schedules')
}
