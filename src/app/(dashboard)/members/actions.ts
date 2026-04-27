'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const role_id = formData.get('role_id') as string
    const skills = formData.getAll('skills') as string[]

    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Erro de autenticação:', authError?.message)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.church_id) {
      console.error('Erro ao buscar perfil ou igreja não vinculada:', profileError?.message)
      return
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
      console.error('Erro ao inserir membro:', memberError?.message)
      return
    }

    // 2. Inserir skills se houver
    if (skills.length > 0) {
      const memberSkills = skills.map(skill_id => ({
        member_id: member.id,
        skill_id
      }))
      const { error: skillsError } = await supabase.from('member_skills').insert(memberSkills)
      if (skillsError) console.error('Erro ao inserir habilidades do membro:', skillsError.message)
    }

    revalidatePath('/members')
  } catch (err) {
    console.error('Erro crítico na action addMember:', err)
  }
}

export async function deleteMember(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) console.error('Erro ao deletar membro:', error.message)
    revalidatePath('/members')
  } catch (err) {
    console.error('Erro crítico na action deleteMember:', err)
  }
}
