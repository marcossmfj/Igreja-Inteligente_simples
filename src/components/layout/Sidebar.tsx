'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, UserSquare2, Stethoscope, Users2, CalendarDays, LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

const menuItems = [
  { name: 'Início', href: '/', icon: LayoutDashboard },
  { name: 'Membros', href: '/members', icon: Users },
  { name: 'Cargos', href: '/roles', icon: UserSquare2 },
  { name: 'Habilidades', href: '/skills', icon: Stethoscope },
  { name: 'Visitantes', href: '/visitors', icon: Users2 },
  { name: 'Escalas', href: '/schedules', icon: CalendarDays },
]

type ProfileData = { role: string; church: string; email: string; loading: boolean }

export function Sidebar() {
  const pathname = usePathname()
  const [state, setState] = useState<ProfileData>({ role: '', church: '', email: '', loading: true })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p } = await supabase.from('profiles').select('role, churches(name)').eq('id', user.id).single()
        setState({
          role: p?.role || 'user',
          email: user.email || '',
          church: (p?.churches as any)?.name || '',
          loading: false
        })
      }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col w-72 bg-white border-r border-slate-100 min-h-screen sticky top-0">
      <div className="px-10 py-12">
        <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">
          IGREJA<br/><span className="text-blue-600">INTELIGENTE</span>
        </h1>
      </div>
      <nav className="flex-1 px-6 space-y-2">
        {state.role === 'master' && (
          <Link href="/master" className="flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 rounded-2xl mb-8 hover:bg-amber-100 transition-all border border-amber-100">
            <ShieldCheck className="mr-3 h-4 w-4" /> Painel Master
          </Link>
        )}
        {menuItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.name} href={item.href} className={cn("flex items-center px-5 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300", active ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 translate-x-1" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900")}>
              <item.icon className={cn("mr-4 h-5 w-5", active ? "text-white" : "text-slate-300")} /> {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-8 mt-auto border-t border-slate-50">
        {state.loading ? (
          <div className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
        ) : (
          <div className="space-y-6">
            <div className="px-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Instituição</p>
              <p className="text-sm font-bold text-slate-800 truncate leading-none mb-3">{state.church || 'Global'}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate leading-none">{state.email}</p>
            </div>
            <button onClick={() => logout()} className="flex items-center w-full px-5 py-3 text-xs font-black text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all tracking-widest uppercase">
              <LogOut className="mr-3 h-4 w-4" /> Sair
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
