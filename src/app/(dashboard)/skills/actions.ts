'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addSkill(formData: FormData) {
  try {
    const name = formData.get('name') as string
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

    const { error } = await supabase.from('skills').insert({ 
      name, 
      church_id: profile.church_id 
    })
    
    if (error) {
      return { error: 'Erro ao inserir habilidade: ' + error.message }
    }

    revalidatePath('/skills')
    return { success: true }
  } catch (err: any) {
    return { error: 'Erro inesperado: ' + err.message }
  }
}

export async function deleteSkill(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) {
      return { error: 'Erro ao deletar habilidade: ' + error.message }
    }
    revalidatePath('/skills')
    return { success: true }
  } catch (err: any) {
    return { error: 'Erro inesperado: ' + err.message }
  }
}
