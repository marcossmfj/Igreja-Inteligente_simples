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
      console.error('Erro ao inserir habilidade:', error)
      return { error: 'Erro ao inserir habilidade: ' + (error?.message || 'Erro desconhecido') }
    }

    revalidatePath('/skills')
    return { success: true }
  } catch (err: any) {
    console.error('Erro inesperado em addSkill:', err)
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function updateSkill(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const supabase = await createClient()

    const { error } = await supabase
      .from('skills')
      .update({ name })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar habilidade:', error)
      return { error: 'Erro ao atualizar habilidade: ' + error.message }
    }

    revalidatePath('/skills')
    return { success: true }
  } catch (err: any) {
    console.error('Erro inesperado em updateSkill:', err)
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function deleteSkill(id: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar habilidade:', error.message)
      return
    }
    revalidatePath('/skills')
  } catch (err: any) {
    console.error('Erro inesperado ao deletar habilidade:', err?.message || 'Erro desconhecido')
  }
}
