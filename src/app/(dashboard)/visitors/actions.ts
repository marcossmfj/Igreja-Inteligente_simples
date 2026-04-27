import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addVisitor(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('church_id')
    .eq('id', user.id)
    .single()

  if (!profile?.church_id) {
    console.error('Usuário sem igreja vinculada')
    return
  }

  const { error } = await supabase.from('visitors').insert({ 
    name, 
    phone, 
    church_id: profile.church_id 
  })
  
  if (error) console.error('Erro ao inserir visitante:', error.message)

  revalidatePath('/visitors')
}

export async function deleteVisitor(id: string) {
  const supabase = await createClient()
  await supabase.from('visitors').delete().eq('id', id)
  revalidatePath('/visitors')
}
