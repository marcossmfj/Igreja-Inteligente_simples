'use client'

import { ShieldAlert, MessageCircle, CreditCard, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function BlockedPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-200/60 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          
          {/* Ícone de Alerta */}
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>

          {/* Texto Principal */}
          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
              Acesso <span className="text-red-500">Suspenso</span>
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              O período de teste ou sua assinatura expirou. Para continuar gerenciando sua igreja com inteligência, regularize seu acesso.
            </p>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            <a 
              href="https://wa.me/SEU_NUMERO_AQUI" 
              target="_blank"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200"
            >
              <MessageCircle className="w-4 h-4" />
              Falar com Suporte (WhatsApp)
            </a>
            
            <button 
              disabled
              className="w-full bg-white border border-slate-200 text-slate-400 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              Renovar Online (Em breve)
            </button>
          </div>

          {/* Rodapé */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600 font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sair da Conta
            </button>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              Igreja Inteligente &copy; 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
