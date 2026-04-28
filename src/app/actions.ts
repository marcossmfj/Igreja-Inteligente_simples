'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function registerChurch(formData: FormData) {
  const userName = formData.get('userName') as string
  const churchName = formData.get('churchName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabaseAdmin = createAdminClient()

  // 1. Criar o usuário no Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: userName }
  })

  if (authError) {
    console.error('Erro ao criar usuário:', authError)
    return { error: 'Erro ao criar usuário: ' + authError.message }
  }

  // 2. Criar a igreja com status pendente
  const { data: churchData, error: churchError } = await supabaseAdmin
    .from('churches')
    .insert([{ 
      name: churchName,
      status: 'pending' // Novo campo que precisamos tratar no master
    }])
    .select()
    .single()

  if (churchError) {
    console.error('Erro ao criar igreja:', churchError)
    return { error: 'Erro ao criar igreja: ' + churchError.message }
  }

  // 3. Vincular usuário à igreja e definir role como admin
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      church_id: churchData.id,
      role: 'admin'
    })
    .eq('id', authData.user.id)

  if (profileError) {
    console.error('Erro ao vincular perfil:', profileError)
    return { error: 'Erro ao vincular perfil: ' + profileError.message }
  }

  revalidatePath('/master')
  return { success: true }
}
