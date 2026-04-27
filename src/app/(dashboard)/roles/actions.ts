'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addRole(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Erro de autenticação:', authError?.message)
      return
    }

    // Buscar o perfil do usuário para pegar a igreja
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.church_id) {
      console.error('Erro ao buscar perfil ou igreja não vinculada:', profileError?.message)
      return
    }

    const { error } = await supabase.from('roles').insert({ 
      name, 
      church_id: profile.church_id 
    })

    if (error) {
      console.error('Erro ao inserir cargo no banco:', error.message)
    }

    revalidatePath('/roles')
  } catch (err) {
    console.error('Erro crítico na action addRole:', err)
  }
}

export async function deleteRole(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('roles').delete().eq('id', id)
    if (error) console.error('Erro ao deletar cargo:', error.message)
    revalidatePath('/roles')
  } catch (err) {
    console.error('Erro crítico na action deleteRole:', err)
  }
}
