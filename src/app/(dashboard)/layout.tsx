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

  // Verificar se a igreja está bloqueada ou se a assinatura expirou
  const { data: profile } = await supabase
    .from('profiles')
    .select('church_id, role, churches(is_blocked, subscription_expires_at)')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'master') {
    const church = profile?.churches as any
    const isBlocked = church?.is_blocked
    const expiresAt = church?.subscription_expires_at ? new Date(church.subscription_expires_at) : null
    const isExpired = expiresAt ? expiresAt < new Date() : false

    if (isBlocked || isExpired) {
      redirect('/blocked')
    }
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
