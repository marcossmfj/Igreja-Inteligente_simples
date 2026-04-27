'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createChurchFromMaster(formData: FormData) {
  const churchName = formData.get('churchName') as string
  const adminEmail = formData.get('adminEmail') as string
  
  const supabase = await createClient()

  // 1. Criar a igreja
  const { data: church, error: churchError } = await supabase
    .from('churches')
    .insert({ name: churchName })
    .select()
    .single()

  if (churchError) {
    console.error('Erro ao criar igreja:', churchError.message)
    return
  }

  // 2. Vincular o usuário administrador (ele já deve existir no Auth)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      church_id: church.id, 
      role: 'admin' 
    })
    .eq('email', adminEmail)

  if (profileError) {
    console.error('Erro ao vincular administrador:', profileError.message)
  }

  revalidatePath('/master')
}
