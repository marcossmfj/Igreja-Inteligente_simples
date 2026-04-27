'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  LayoutDashboard, 
  UserSquare2, 
  Stethoscope, 
  Users2, 
  CalendarDays,
  LogOut,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Membros', href: '/members', icon: Users },
  { name: 'Cargos', href: '/roles', icon: UserSquare2 },
  { name: 'Habilidades', href: '/skills', icon: Stethoscope },
  { name: 'Visitantes', href: '/visitors', icon: Users2 },
  { name: 'Escalas', href: '/schedules', icon: CalendarDays },
]

export function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    async function getRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setRole(data?.role || 'user')
      }
    }
    getRole()
  }, [])

  return (
    <div className="flex flex-col w-64 bg-white border-r min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">Igreja Inteligente</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {role === 'master' && (
          <Link
            href="/master"
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors mb-4 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
              pathname === '/master' && "bg-amber-200"
            )}
          >
            <ShieldCheck className="mr-3 h-5 w-5" />
            Painel Master
          </Link>
        )}
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={() => logout()}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  )
}
