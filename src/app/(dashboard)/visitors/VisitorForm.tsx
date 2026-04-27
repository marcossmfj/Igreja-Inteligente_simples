'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, AlertCircle, User, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { addVisitor } from './actions'

export function VisitorForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await addVisitor(formData)
    setLoading(false)
    
    if (result?.error) {
      setError(result.error)
    } else {
      const form = document.querySelector('form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-sm bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 font-bold animate-in fade-in zoom-in duration-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome Completo</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              name="name" 
              placeholder="Ex: João Silva" 
              required 
              disabled={loading} 
              className="pl-11 h-14 rounded-2xl border-slate-200/60 bg-white focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">WhatsApp</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              name="phone" 
              placeholder="(11) 99999-9999" 
              required 
              disabled={loading} 
              className="pl-11 h-14 rounded-2xl border-slate-200/60 bg-white focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200" 
          disabled={loading}
        >
          {loading ? 'Processando...' : <><Plus className="h-4 w-4 mr-2" /> Registrar Visita</>}
        </Button>
      </form>
    </div>
  )
}
