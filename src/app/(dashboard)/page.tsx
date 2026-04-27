import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Users2, CalendarDays, ArrowRight, ShieldAlert } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('church_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.church_id) {
    if (profile?.role === 'master' || user.email === 'admin@admin.com.br') redirect('/master')
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 animate-in fade-in duration-700">
        <div className="max-w-md w-full bg-white border border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-10 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
            <ShieldAlert className="h-10 w-10 text-slate-400" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quase lá!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Sua conta foi criada, mas ainda não está vinculada a uma instituição. Fale com nosso suporte para liberar seu acesso premium.
            </p>
          </div>
          <div className="pt-4">
            <Link href="https://wa.me/5511999999999" target="_blank" className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-200">
              Falar com Suporte <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { count: mCount } = await supabase.from('members').select('*', { count: 'exact', head: true })
  const { count: vCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true })
  const { count: sCount } = await supabase.from('schedules').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString().split('T')[0])

  const stats = [
    { title: 'Membros', value: mCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50' },
    { title: 'Visitantes', value: vCount || 0, icon: Users2, color: 'text-slate-600', bg: 'bg-slate-100/50' },
    { title: 'Escalas Ativas', value: sCount || 0, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900">Dashboard</h2>
        <p className="text-slate-500 font-medium">Gestão inteligente para sua congregação.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.title} className="border-slate-200/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{s.title}</CardTitle>
              <div className={`p-3 rounded-2xl ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-slate-900 tracking-tighter">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
