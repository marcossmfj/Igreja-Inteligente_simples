'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSkill(formData: FormData) {
  const name = formData.get('name') as string
  const supabase = await createClient()
  
  const { data: profile } = await supabase.from('profiles').select('church_id').single()
  if (!profile?.church_id) return

  await supabase.from('skills').insert({ name, church_id: profile.church_id })
  revalidatePath('/skills')
}

export async function deleteSkill(id: string) {
  const supabase = await createClient()
  await supabase.from('skills').delete().eq('id', id)
  revalidatePath('/skills')
}
