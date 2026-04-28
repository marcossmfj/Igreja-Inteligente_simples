'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function registerChurch(formData: FormData) {
  const userName = formData.get('userName') as string
  const churchName = formData.get('churchName') as string
  const phone = formData.get('phone') as string
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

  // 2. Criar a igreja (bloqueada por padrão para aprovação manual)
  const { data: churchData, error: churchError } = await supabaseAdmin
    .from('churches')
    .insert([{ 
      name: churchName,
      admin_name: userName,
      admin_phone: phone,
      admin_email: email,
      is_blocked: false, // Liberado imediatamente para trial
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias de teste
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
