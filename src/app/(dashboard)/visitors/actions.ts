'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addVisitor(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    
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

    const { error } = await supabase.from('visitors').insert({ 
      name, 
      phone, 
      church_id: profile.church_id 
    })
    
    if (error) {
      console.error('Erro ao inserir visitante:', error)
      return { error: 'Erro ao inserir visitante: ' + (error?.message || 'Erro desconhecido') }
    }

    revalidatePath('/visitors')
    return { success: true }
  } catch (err: any) {
    console.error('Erro inesperado em addVisitor:', err)
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function updateVisitor(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const supabase = await createClient()

    const { error } = await supabase
      .from('visitors')
      .update({ name, phone })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar visitante:', error)
      return { error: 'Erro ao atualizar visitante: ' + error.message }
    }

    revalidatePath('/visitors')
    return { success: true }
  } catch (err: any) {
    console.error('Erro inesperado em updateVisitor:', err)
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function deleteVisitor(id: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('visitors').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar visitante:', error.message)
      return
    }
    revalidatePath('/visitors')
  } catch (err: any) {
    console.error('Erro inesperado ao deletar visitante:', err?.message || 'Erro desconhecido')
  }
}
