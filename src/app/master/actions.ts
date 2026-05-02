'use server'

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
        // Busca o perfil de forma segura
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', adminEmail)
          .maybeSingle()
        
        if (existingProfile) {
          userId = existingProfile.id
        } else {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
          const authUserRecord = users.find(u => u.email === adminEmail)
          if (authUserRecord) userId = authUserRecord.id
        }
      } else {
        return { error: 'Erro no Auth: ' + authError.message }
      }
    }

    if (!userId) return { error: 'Não foi possível identificar o ID do usuário.' }

    // 2. Criar a igreja
    const { data: church, error: churchError } = await supabaseAdmin
      .from('churches')
      .insert({ 
        name: churchName,
        admin_email: adminEmail,
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (churchError) return { error: 'Erro ao criar igreja: ' + churchError.message }

    // 3. Vincular o usuário à igreja
    await supabaseAdmin
      .from('profiles')
      .update({ church_id: church.id, role: 'admin' })
      .eq('id', userId)

    revalidatePath('/master')
    return { success: true }
  } catch (e: unknown) {
    return { error: 'Erro crítico: ' + (e instanceof Error ? e.message : 'Erro desconhecido') }
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
    return { error: e.message }
  }
}

export async function updateChurchSubscription(churchId: string, data: any) {
  try {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('churches')
      .update({
        admin_name: data.admin_name,
        admin_phone: data.admin_phone,
        admin_email: data.admin_email,
        plan_type: data.plan_type,
        subscription_status: data.subscription_status,
        subscription_expires_at: data.subscription_expires_at,
        max_members: parseInt(data.max_members),
        internal_notes: data.internal_notes
      })
      .eq('id', churchId)

    if (error) throw error
    revalidatePath('/master')
    return { success: true }
  } catch (e: any) {
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
    return { error: e.message }
  }
}

export async function deleteChurchData(churchId: string) {
  try {
    const supabaseAdmin = createAdminClient()
    
    // 1. Buscar os perfis (usuários) vinculados a esta igreja
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('church_id', churchId)

    // 2. Excluir os usuários do Auth (isso dá trigger no ON DELETE CASCADE para apagar a linha em 'profiles')
    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        await supabaseAdmin.auth.admin.deleteUser(p.id)
      }
    }

    // 3. Apagar a igreja (o ON DELETE CASCADE nas outras tabelas apagará membros, visitantes, etc)
    const { error } = await supabaseAdmin
      .from('churches')
      .delete()
      .eq('id', churchId)

    if (error) throw error
    revalidatePath('/master')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function resetChurchAdminPassword(adminEmail: string, newPassword?: string) {
  try {
    const supabaseAdmin = createAdminClient()
    
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const user = users.find(u => u.email === adminEmail)
    
    if (!user) return { error: 'Usuário administrador não encontrado no sistema de autenticação.' }

    const pwdToSet = newPassword || 'Mudar123@'
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: pwdToSet })
    
    if (error) throw error
    return { success: true, newPassword: pwdToSet }
  } catch (e: any) {
    return { error: e.message }
  }
}

