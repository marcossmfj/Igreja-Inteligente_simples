'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addRole(formData: FormData) {
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

    const { error } = await supabase.from('roles').insert({ 
      name, 
      church_id: profile.church_id 
    })

    if (error) {
      console.error('Erro no banco em addRole:', error)
      return { error: 'Erro no banco: ' + (error?.message || 'Erro desconhecido') }
    }

    revalidatePath('/roles')
    return { success: true }
  } catch (err: any) {
    console.error('Erro inesperado em addRole:', err)
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function updateRole(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const supabase = await createClient()

    const { error } = await supabase
      .from('roles')
      .update({ name })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar cargo:', error)
      return { error: 'Erro ao atualizar cargo: ' + error.message }
    }

    revalidatePath('/roles')
    return { success: true }
  } catch (err: any) {
    console.error('Erro inesperado em updateRole:', err)
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('roles').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar cargo:', error.message)
      return
    }
    revalidatePath('/roles')
  } catch (err: any) {
    console.error('Erro inesperado ao deletar cargo:', err?.message || 'Erro desconhecido')
  }
}
