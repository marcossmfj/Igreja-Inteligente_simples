import { LogOut, ShieldAlert } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { Button } from '@/components/ui/button'

export default function BlockedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-destructive/20">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Suspenso</h1>
        <p className="text-muted-foreground mb-8">
          O acesso desta igreja ao sistema foi temporariamente bloqueado pelo administrador. 
          Entre em contato com o suporte para regularizar sua situação.
        </p>
        <div className="space-y-4">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={async () => {
              'use server'
              await logout()
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  )
}
