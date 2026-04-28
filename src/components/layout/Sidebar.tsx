'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, LayoutDashboard, UserSquare2, Stethoscope, Users2, CalendarDays, LogOut, ShieldCheck, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

const menuItems = [
  { name: 'Início', href: '/home', icon: LayoutDashboard },
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
  const [isOpen, setIsOpen] = useState(false)

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

  // Fechar sidebar ao mudar de rota (mobile)
  useEffect(() => {
    if (isOpen) setIsOpen(false)
  }, [pathname, isOpen])

  return (
    <>
      {/* Botão Hambúrguer (Mobile Only) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl text-slate-900 active:scale-95 transition-all"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay (Mobile Only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "flex flex-col w-72 bg-white border-r border-slate-100 min-h-screen fixed lg:sticky top-0 z-50 lg:z-0 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.02)] transition-transform duration-500 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="px-10 py-16 flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-[0.8] uppercase">
            Igreja<br/><span className="text-blue-600 text-3xl">Inteligente</span>
          </h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
          {state.role === 'master' && (
            <Link href="/master" className="group flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 rounded-2xl mb-10 border border-amber-100/50 hover:bg-amber-100 transition-all duration-300">
              <ShieldCheck className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" /> Painel Master
            </Link>
          )}
          
          {menuItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={cn(
                  "flex items-center px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-500", 
                  active 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 translate-x-2" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                )}
              >
                <item.icon className={cn("mr-4 h-5 w-5", active ? "text-white" : "text-slate-300")} /> 
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-10 mt-auto border-t border-slate-50 bg-slate-50/20">
          {state.loading ? (
            <div className="h-24 bg-slate-100 rounded-3xl animate-pulse" />
          ) : (
            <div className="space-y-8">
              <div className="px-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Instituição</p>
                <p className="text-sm font-black text-slate-800 truncate mb-1">{state.church || 'Global Admin'}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{state.role}</p>
              </div>
              <button 
                onClick={() => logout()} 
                className="flex items-center w-full px-6 py-4 text-[10px] font-black text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all tracking-[0.2em] uppercase border border-transparent hover:border-red-100"
              >
                <LogOut className="mr-3 h-4 w-4" /> Encerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
