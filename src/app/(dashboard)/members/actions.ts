'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMember(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const role_id = formData.get('role_id') as string
  const skills = formData.getAll('skills') as string[] // Array of skill IDs

  const supabase = await createClient()
  
  const { data: profile } = await supabase.from('profiles').select('church_id').single()
  if (!profile?.church_id) return

  // 1. Inserir membro
  const { data: member, error } = await supabase
    .from('members')
    .insert({ 
      name, 
      phone, 
      role_id: role_id || null, 
      church_id: profile.church_id 
    })
    .select()
    .single()

  if (error || !member) return

  // 2. Inserir skills se houver
  if (skills.length > 0) {
    const memberSkills = skills.map(skill_id => ({
      member_id: member.id,
      skill_id
    }))
    await supabase.from('member_skills').insert(memberSkills)
  }

  revalidatePath('/members')
}

export async function deleteMember(id: string) {
  const supabase = await createClient()
  await supabase.from('members').delete().eq('id', id)
  revalidatePath('/members')
}
