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
        console.log('Usuário já existe no Auth, buscando ou criando perfil...')
        
        // Busca o perfil de forma segura (maybeSingle não dá erro se não achar nada)
        const { data: existingProfile, error: searchError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', adminEmail)
          .maybeSingle()
        
        if (searchError) {
          console.error('Erro ao buscar perfil:', searchError)
          return { error: 'Erro ao buscar perfil: ' + (searchError?.message || 'Erro desconhecido') }
        }

        if (existingProfile) {
          userId = existingProfile.id
        } else {
          // CASO ESPECIAL: Usuário existe no Auth mas não no Profiles
          // Vamos tentar buscar o ID dele no Auth para criar o perfil
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
          const authUserRecord = users.find(u => u.email === adminEmail)
          
          if (listError || !authUserRecord) {
            console.error('Usuário existe mas perfil inacessível:', listError)
            return { error: 'Usuário existe mas seu perfil está inacessível. Tente usar outro e-mail.' }
          }
          
          userId = authUserRecord.id
          // Cria o perfil faltante
          await supabaseAdmin.from('profiles').insert({ id: userId, email: adminEmail })
        }
      } else {
        console.error('Erro no Auth ao criar usuário:', authError)
        return { error: 'Erro no Auth: ' + (authError?.message || 'Erro desconhecido') }
      }
    }

    if (!userId) return { error: 'Não foi possível identificar o ID do usuário.' }

    // 2. Criar a igreja
    const { data: church, error: churchError } = await supabaseAdmin
      .from('churches')
      .insert({ name: churchName })
      .select()
      .single()

    if (churchError) {
      console.error('Erro ao criar igreja:', churchError)
      return { error: 'Erro ao criar igreja: ' + (churchError?.message || 'Erro desconhecido') }
    }

    // 3. Vincular o usuário à igreja
    console.log('Vinculando igreja', church.id, 'ao usuário', userId)
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        church_id: church.id, 
        role: 'admin' 
      })
      .or(`id.eq.${userId},email.eq.${adminEmail}`) // Tenta pelo ID ou pelo E-mail

    if (profileError) {
      console.error('Erro ao vincular perfil:', profileError)
      return { error: 'Erro ao vincular perfil: ' + (profileError?.message || 'Erro desconhecido') }
    }

    revalidatePath('/master')
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro desconhecido'
    console.error('CRASH NA AÇÃO createChurchFromMaster:', e)
    return { error: 'Erro crítico no servidor: ' + message }
  }
}

export async function toggleChurchBlock(churchId: string, isBlocked: boolean) {
  try {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('churches')
      .update({ is_blocked: !isBlocked })
      .eq('id', churchId)

    if (error) throw error
    revalidatePath('/master')
    return { success: true }
  } catch (e: any) {
    console.error('Erro ao alternar bloqueio da igreja:', e.message)
    return { error: e.message }
  }
}

export async function updateChurchName(churchId: string, name: string) {
  try {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('churches')
      .update({ name })
      .eq('id', churchId)

    if (error) throw error
    revalidatePath('/master')
    return { success: true }
  } catch (e: any) {
    console.error('Erro ao atualizar nome da igreja:', e.message)
    return { error: e.message }
  }
}
