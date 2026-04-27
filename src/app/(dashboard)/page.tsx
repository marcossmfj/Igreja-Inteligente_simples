import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Users2, CalendarDays } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // USANDO ADMIN CLIENT AQUI PARA BYPASSAR RLS
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('church_id, role')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil:', error.message)
  }

  // Se não tem church_id, verifica se deve ir para o painel master
  if (!profile?.church_id) {
    // Se o cargo for master, ou se o email for o seu admin principal
    if (profile?.role === 'master' || user.email === 'admin@admin.com.br') {
      redirect('/master')
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="space-y-2">
          <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 mb-4 inline-block">
            LOGADO COMO: {user.email}
          </div>
          <h2 className="text-3xl font-bold">Bem-vindo!</h2>
          <p className="text-muted-foreground max-w-md">
            Sua conta ainda não está vinculada a nenhuma igreja no banco de dados.
          </p>
        </div>
        <Link 
          href="https://wa.me/5511999999999" 
          target="_blank"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Falar com Suporte
        </Link>
      </div>
    )
  }

  // Se já tem igreja, mostra as stats
  const { count: membersCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  const { count: visitorsCount } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })

  const { count: schedulesCount } = await supabase
    .from('schedules')
    .select('*', { count: 'exact', head: true })
    .gte('date', new Date().toISOString().split('T')[0])

  const stats = [
    {
      title: 'Total de Membros',
      value: membersCount || 0,
      icon: Users,
      description: 'Membros ativos na congregação',
    },
    {
      title: 'Visitantes',
      value: visitorsCount || 0,
      icon: Users2,
      description: 'Visitantes registrados recentemente',
    },
    {
      title: 'Próximas Escalas',
      value: schedulesCount || 0,
      icon: CalendarDays,
      description: 'Escalas agendadas para o futuro',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Gerenciamento central da sua congregação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
