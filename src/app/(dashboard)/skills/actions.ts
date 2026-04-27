'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSkill(formData: FormData) {
  const name = formData.get('name') as string
  const supabase = await createClient()
  
  const { data: profile, error: profileError } = await supabase.from('profiles').select('church_id').single()
  
  if (profileError || !profile?.church_id) {
    console.error('Error fetching profile or missing church_id:', profileError)
    return
  }

  const { error } = await supabase.from('skills').insert({ name, church_id: profile.church_id })
  
  if (error) {
    console.error('Error inserting skill:', error)
  }

  revalidatePath('/skills')
}

export async function deleteSkill(id: string) {
  const supabase = await createClient()
  await supabase.from('skills').delete().eq('id', id)
  revalidatePath('/skills')
}
