'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSkill(formData: FormData) {
  try {
    const name = formData.get('name') as string
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

    const { error } = await supabase.from('skills').insert({ 
      name, 
      church_id: profile.church_id 
    })
    
    if (error) console.error('Erro ao inserir habilidade:', error.message)

    revalidatePath('/skills')
  } catch (err) {
    console.error('Erro crítico na action addSkill:', err)
  }
}

export async function deleteSkill(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) console.error('Erro ao deletar habilidade:', error.message)
    revalidatePath('/skills')
  } catch (err) {
    console.error('Erro crítico na action deleteSkill:', err)
  }
}
