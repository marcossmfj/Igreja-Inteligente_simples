'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addVisitor(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const supabase = await createClient()
  
  const { data: profile } = await supabase.from('profiles').select('church_id').single()
  if (!profile?.church_id) return

  await supabase.from('visitors').insert({ 
    name, 
    phone, 
    church_id: profile.church_id 
  })
  revalidatePath('/visitors')
}

export async function deleteVisitor(id: string) {
  const supabase = await createClient()
  await supabase.from('visitors').delete().eq('id', id)
  revalidatePath('/visitors')
}
