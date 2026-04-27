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
import { Plus, Pencil, AlertCircle, User, Phone, Briefcase, Star } from 'lucide-react'
import { addMember, updateMember } from './actions'
import { Checkbox } from '@/components/ui/checkbox'

interface Role {
  id: string
  name: string
}

interface Skill {
  id: string
  name: string
}

interface Member {
  id: string
  name: string
  phone: string | null
  role_id: string | null
  member_skills?: { skill_id: string }[]
}

export function MemberForm({ 
  roles, 
  skills, 
  member 
}: { 
  roles: Role[], 
  skills: Skill[],
  member?: Member
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const isEditing = !!member
  const memberSkillIds = member?.member_skills?.map(ms => ms.skill_id) || []

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    let result
    if (isEditing) {
      result = await updateMember(member.id, formData)
    } else {
      result = await addMember(formData)
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
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
            <Plus className="mr-2 h-5 w-5" /> Novo Membro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditing ? 'Editar Membro' : 'Novo Membro'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            {isEditing 
              ? 'Aprimore as informações deste membro da comunidade.' 
              : 'Registre um novo integrante em sua igreja.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 font-bold animate-in fade-in zoom-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome Completo</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Ex: João Silva" 
                  defaultValue={member?.name} 
                  required 
                  disabled={loading}
                  className="pl-11 h-12 rounded-xl border-slate-200/60 bg-slate-50/50 focus:bg-white focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">WhatsApp</Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="(11) 99999-9999" 
                  defaultValue={member?.phone || ''} 
                  disabled={loading}
                  className="pl-11 h-12 rounded-xl border-slate-200/60 bg-slate-50/50 focus:bg-white focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cargo / Função</Label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  id="role_id"
                  name="role_id"
                  defaultValue={member?.role_id || ''}
                  disabled={loading}
                  className="flex h-12 w-full rounded-xl border border-slate-200/60 bg-slate-50/50 pl-11 pr-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium appearance-none"
                >
                  <option value="">Selecione um cargo</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Habilidades</Label>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60 max-h-40 overflow-y-auto">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox
                      id={`skill-${skill.id}`}
                      name="skills"
                      value={skill.id}
                      defaultChecked={memberSkillIds.includes(skill.id)}
                      disabled={loading}
                      className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/10"
                    />
                    <label
                      htmlFor={`skill-${skill.id}`}
                      className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {skill.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200" 
              disabled={loading}
            >
              {loading 
                ? 'Processando...' 
                : (isEditing ? 'Salvar Alterações' : 'Finalizar Cadastro')}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
