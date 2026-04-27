'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createChurchFromMaster(formData: FormData) {
  try {
    const churchName = formData.get('churchName') as string
    const adminEmail = formData.get('adminEmail') as string
    const adminPassword = formData.get('adminPassword') as string
    
    console.log('Iniciando criação para:', adminEmail)

    const supabaseAdmin = createAdminClient()

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.length < 10) {
      return { error: 'CONFIGURAÇÃO_FALTANDO: A chave SUPABASE_SERVICE_ROLE_KEY não foi encontrada na Vercel.' }
    }

    // 1. Tentar criar o usuário ou buscar se já existe
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    })

    let userId = authUser?.user?.id

    if (authError) {
      if (authError.message.includes('already') || authError.status === 422) {
        console.log('Usuário já existe, buscando ID...')
        const { data: existingUser, error: searchError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', adminEmail)
          .single()
        
        if (searchError) return { error: 'Erro ao buscar usuário existente: ' + searchError.message }
        userId = existingUser?.id
      } else {
        return { error: 'Erro no Auth: ' + authError.message }
      }
    }

    if (!userId) return { error: 'Não foi possível identificar o ID do usuário.' }

    // 2. Criar a igreja
    const { data: church, error: churchError } = await supabaseAdmin
      .from('churches')
      .insert({ name: churchName })
      .select()
      .single()

    if (churchError) return { error: 'Erro ao criar igreja: ' + churchError.message }

    // 3. Vincular o usuário à igreja
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        church_id: church.id, 
        role: 'admin' 
      })
      .eq('id', userId)

    if (profileError) return { error: 'Erro ao vincular perfil: ' + profileError.message }

    revalidatePath('/master')
    return { success: true }
  } catch (e: any) {
    console.error('CRASH NA AÇÃO:', e)
    return { error: 'Erro crítico no servidor: ' + (e.message || 'Erro desconhecido') }
  }
}
