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

  // 3. Listar igrejas existentes com contagens (usando subqueries)
  // Usamos supabaseAdmin para bypassar o RLS e contar corretamente para TODAS as igrejas
  const { data: churches } = await supabaseAdmin
    .from('churches')
    .select(`
      *,
      profiles(email),
      member_count:members(count),
      schedule_count:schedules(count),
      visitor_count:visitors(count)
    `)
    .order('created_at', { ascending: false })

  // Formatar as contagens que o Supabase retorna como arrays/objetos
  const formattedChurches = churches?.map(c => ({
    ...c,
    member_count: (c.member_count as any)?.[0]?.count || 0,
    schedule_count: (c.schedule_count as any)?.[0]?.count || 0,
    visitor_count: (c.visitor_count as any)?.[0]?.count || 0
  }))

  return <MasterPanelClient churches={formattedChurches || []} />
}
