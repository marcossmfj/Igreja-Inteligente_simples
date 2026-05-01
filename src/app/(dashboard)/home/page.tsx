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
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in zoom-in duration-1000">
        <div className="max-w-md w-full bg-white border border-slate-100 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[3rem] p-12 text-center space-y-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
            <ShieldAlert className="h-12 w-12 text-slate-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">Acesso<br/>Restrito</h2>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Sua conta premium está ativa, mas aguarda vinculação institucional. Fale com nosso suporte para liberação imediata.
            </p>
          </div>
          <Link href="https://wa.me/5511999999999" target="_blank" className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-sm font-bold text-white hover:bg-blue-600 transition-all duration-500 shadow-2xl shadow-blue-200">
            Liberar Acesso <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    )
  }

  const { count: mCount } = await supabase.from('members').select('*', { count: 'exact', head: true })
  const { count: vCount } = await supabase.from('visitors').select('*', { count: 'exact', head: true })
  const { count: sCount } = await supabase.from('schedules').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString().split('T')[0])

  const stats = [
    { title: 'Membros', value: mCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Visitantes', value: vCount || 0, icon: Users2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Escalas Ativas', value: sCount || 0, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="min-h-full bg-slate-50/50 -m-8 p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="max-w-7xl mx-auto space-y-12 py-10">
        
        {/* Banner de Boas-Vindas Premium */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 md:p-14 shadow-2xl shadow-blue-900/20 group">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white"/>
            </svg>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                A Paz do Senhor, <span className="text-blue-400">{user.user_metadata?.full_name || 'Líder'}</span>! 🙏
              </h2>
              <p className="text-slate-300 font-medium text-lg max-w-xl leading-relaxed">
                Bem-vindo ao futuro do seu ministério. Sua igreja agora conta com uma gestão ágil, escalas automatizadas e onboarding atrito zero.
              </p>
            </div>
            <Link 
              href="/schedules" 
              className="inline-flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase tracking-widest text-xs px-8 py-5 rounded-2xl shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.7)] hover:-translate-y-1 transition-all duration-500 whitespace-nowrap"
            >
              Ver Minhas Escalas <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Visão Geral</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Métricas em tempo real</p>
        </div>
        
        <div className="grid gap-10 md:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.title} className="group border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] bg-white overflow-hidden hover:-translate-y-2 transition-all duration-500">
              <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                <CardTitle className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">{s.title}</CardTitle>
                <div className={`p-4 rounded-2xl ${s.bg} group-hover:scale-110 transition-transform duration-500`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="text-6xl font-black text-slate-900 tracking-tighter">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
