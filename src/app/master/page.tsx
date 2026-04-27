import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import MasterPanelClient from './MasterPanelClient'

export default async function MasterPanel() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  
  // 1. Verificar se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Verificar se é Master (usando o admin client para evitar recursão)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'master') {
    redirect('/')
  }

  // 3. Listar igrejas existentes
  const { data: rawChurches } = await supabaseAdmin
    .from('churches')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })

  const churches = rawChurches as (any & { profiles: { email: string }[] })[] | null

  return <MasterPanelClient churches={churches || []} />
}
