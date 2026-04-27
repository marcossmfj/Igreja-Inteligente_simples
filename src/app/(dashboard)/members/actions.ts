'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const role_id = formData.get('role_id') as string
    const skills = formData.getAll('skills') as string[]

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Usuário não autenticado.' }
    }

    // Usar Admin para evitar o erro 500 de recursividade do RLS na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.church_id) {
      return { error: 'Seu usuário não está vinculado a nenhuma igreja. Verifique o Painel Master.' }
    }

    // 1. Inserir membro
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({ 
        name, 
        phone, 
        role_id: role_id || null, 
        church_id: profile.church_id 
      })
      .select()
      .single()

    if (memberError || !member) {
      return { error: 'Erro ao inserir membro: ' + (memberError?.message || 'Erro desconhecido') }
    }

    // 2. Inserir skills se houver
    if (skills.length > 0) {
      const memberSkills = skills.map(skill_id => ({
        member_id: member.id,
        skill_id
      }))
      const { error: skillsError } = await supabase.from('member_skills').insert(memberSkills)
      if (skillsError) {
        return { error: 'Erro ao inserir habilidades do membro: ' + (skillsError?.message || 'Erro desconhecido') }
      }
    }

    revalidatePath('/members')
    return { success: true }
  } catch (err: any) {
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function updateMember(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const role_id = formData.get('role_id') as string
    const skills = formData.getAll('skills') as string[]

    const supabase = await createClient()

    // 1. Atualizar dados básicos
    const { error: memberError } = await supabase
      .from('members')
      .update({ 
        name, 
        phone, 
        role_id: role_id || null
      })
      .eq('id', id)

    if (memberError) {
      return { error: 'Erro ao atualizar membro: ' + memberError.message }
    }

    // 2. Atualizar skills (remover antigas e inserir novas)
    await supabase.from('member_skills').delete().eq('member_id', id)
    
    if (skills.length > 0) {
      const memberSkills = skills.map(skill_id => ({
        member_id: id,
        skill_id
      }))
      const { error: skillsError } = await supabase.from('member_skills').insert(memberSkills)
      if (skillsError) {
        return { error: 'Erro ao atualizar habilidades: ' + skillsError.message }
      }
    }

    revalidatePath('/members')
    return { success: true }
  } catch (err: any) {
    return { error: 'Erro inesperado: ' + err.message }
  }
}

export async function deleteMember(id: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar membro:', error.message)
      return
    }
    revalidatePath('/members')
  } catch (err: any) {
    console.error('Erro inesperado ao deletar membro:', err?.message || 'Erro desconhecido')
  }
}
