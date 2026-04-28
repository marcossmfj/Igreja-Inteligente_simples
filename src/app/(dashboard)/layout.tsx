import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar se a igreja está bloqueada
  const { data: profile } = await supabase
    .from('profiles')
    .select('church_id, role, churches(is_blocked)')
    .eq('id', user.id)
    .single()

  // @ts-expect-error - churches é um retorno do join do supabase
  if (profile?.churches?.is_blocked && profile.role !== 'master') {
    redirect('/blocked')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 w-full pt-28 lg:pt-8 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
