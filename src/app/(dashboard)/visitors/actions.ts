'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addVisitor(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    
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

    const { error } = await supabase.from('visitors').insert({ 
      name, 
      phone, 
      church_id: profile.church_id 
    })
    
    if (error) console.error('Erro ao inserir visitante:', error.message)

    revalidatePath('/visitors')
  } catch (err) {
    console.error('Erro crítico na action addVisitor:', err)
  }
}

export async function deleteVisitor(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('visitors').delete().eq('id', id)
    if (error) console.error('Erro ao deletar visitante:', error.message)
    revalidatePath('/visitors')
  } catch (err) {
    console.error('Erro crítico na action deleteVisitor:', err)
  }
}
