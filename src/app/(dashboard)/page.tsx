import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Users2, CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

async function createChurch(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Criar a igreja
  const { data: church, error: churchError } = await supabase
    .from('churches')
    .insert({ name })
    .select()
    .single()

  if (churchError) return

  // 2. Vincular o usuário à igreja como admin
  await supabase
    .from('profiles')
    .update({ church_id: church.id, role: 'admin' })
    .eq('id', user.id)

  revalidatePath('/')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('church_id, role')
    .single()

  if (!profile?.church_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Bem-vindo!</h2>
          <p className="text-muted-foreground">
            Você ainda não está vinculado a nenhuma igreja.
          </p>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Criar Nova Igreja</CardTitle>
            <CardDescription>
              Comece criando o perfil da sua igreja no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createChurch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Igreja</label>
                <input
                  name="name"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ex: Igreja Batista Central"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Criar Igreja
              </Button>
            </form>
          </CardContent>
        </Card>
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
