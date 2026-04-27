'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, AlertCircle, Stethoscope, Zap } from 'lucide-react'
import { addSkill, updateSkill } from './actions'
import { cn } from '@/lib/utils'

interface Skill {
  id: string
  name: string
}

export function SkillForm({ skill }: { skill?: Skill }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const isEditing = !!skill

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    let result
    if (isEditing && skill) {
      result = await updateSkill(skill.id, formData)
    } else {
      result = await addSkill(formData)
    }
    
    setLoading(false)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) setError(null)
    }}>
      <DialogTrigger asChild>
        {isEditing ? (
          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl transition-all">
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <Button className="h-12 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
            <Plus className="mr-2 h-4 w-4" /> Nova Habilidade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tighter">
                {isEditing ? 'Editar Habilidade' : 'Nova Habilidade'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 font-medium">
              Defina as aptidões técnicas para as escalas de serviço.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-8 space-y-6 bg-white">
          {error && (
            <div className="p-4 text-sm bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 font-bold animate-in fade-in zoom-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome da Habilidade</label>
              <div className="relative group">
                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Ex: Guitarrista, Sonoplasta, Mídia" 
                  defaultValue={skill?.name} 
                  required 
                  disabled={loading}
                  className="pl-11 h-14 rounded-2xl border-slate-200/60 bg-white focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200" 
              disabled={loading}
            >
              {loading 
                ? 'Processando...' 
                : (isEditing ? 'Salvar Alterações' : 'Adicionar Habilidade')}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
