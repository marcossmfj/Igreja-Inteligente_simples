'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createChurchFromMaster(formData: FormData) {
  const churchName = formData.get('churchName') as string
  const adminEmail = formData.get('adminEmail') as string
  const adminPassword = formData.get('adminPassword') as string
  
  const supabaseAdmin = createAdminClient()

  // 1. Tentar criar o usuário ou buscar se já existe
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  })

  let userId = authUser?.user?.id

  // Se o erro for que o usuário já existe, vamos buscar o ID dele
  if (authError && authError.message.includes('already registered')) {
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .single()
    
    userId = existingUser?.id
  } else if (authError) {
    console.error('Erro no Auth:', authError.message)
    return
  }

  if (!userId) {
    console.error('Não foi possível obter o ID do usuário')
    return
  }

  // 2. Criar a igreja
  const { data: church, error: churchError } = await supabaseAdmin
    .from('churches')
    .insert({ name: churchName })
    .select()
    .single()

  if (churchError) {
    console.error('Erro ao criar igreja:', churchError.message)
    return
  }

  // 3. Vincular o usuário à igreja como admin (usando admin client para garantir)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      church_id: church.id, 
      role: 'admin' 
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Erro ao vincular perfil:', profileError.message)
  }

  revalidatePath('/master')
}
