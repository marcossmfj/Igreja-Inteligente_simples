'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createChurchFromMaster(formData: FormData) {
  const churchName = formData.get('churchName') as string
  const adminEmail = formData.get('adminEmail') as string
  const adminPassword = formData.get('adminPassword') as string
  
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // 1. Criar o usuário no Auth (sem precisar confirmar e-mail)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  })

  if (authError) {
    console.error('Erro ao criar usuário no Auth:', authError.message)
    return
  }

  // 2. Criar a igreja
  const { data: church, error: churchError } = await supabase
    .from('churches')
    .insert({ name: churchName })
    .select()
    .single()

  if (churchError) {
    console.error('Erro ao criar igreja:', churchError.message)
    return
  }

  // 3. Vincular o usuário à igreja como admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      church_id: church.id, 
      role: 'admin' 
    })
    .eq('id', authUser.user.id)

  if (profileError) {
    console.error('Erro ao vincular perfil:', profileError.message)
  }

  revalidatePath('/master')
}
