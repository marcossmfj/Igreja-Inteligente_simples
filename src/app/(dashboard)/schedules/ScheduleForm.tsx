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
import { Plus, AlertCircle, Calendar, Clock, Briefcase, User } from 'lucide-react'
import { addSchedule } from './actions'

interface Skill {
  id: string
  name: string
}

interface Member {
  id: string
  name: string
  member_skills: { skill_id: string }[]
}

export function ScheduleForm({ 
  skills, 
  members,
  defaultEventName,
  defaultDate,
  defaultSkillId,
  trigger
}: { 
  skills: Skill[], 
  members: Member[],
  defaultEventName?: string,
  defaultDate?: string,
  defaultSkillId?: string,
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string>(defaultSkillId || '')

  const filteredMembers = members.filter(member => 
    !selectedSkill || member.member_skills.some(ms => ms.skill_id === selectedSkill)
  )

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await addSchedule(formData)
    setLoading(false)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      if (!defaultSkillId) setSelectedSkill('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setError(null)
        if (!defaultSkillId) setSelectedSkill('')
      }
    }}>
      <DialogTrigger
        render={
          trigger || (
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
              <Plus className="mr-2 h-5 w-5" /> Nova Escala
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Organizar Escala</DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Defina quem servirá nos próximos eventos.
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
              <Label htmlFor="event_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome do Evento</Label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="event_name" 
                  name="event_name" 
                  placeholder="Ex: Culto de Celebração" 
                  defaultValue={defaultEventName}
                  required 
                  className="pl-11 h-12 rounded-xl border-slate-200/60 bg-slate-50/50 focus:bg-white focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Data</Label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  defaultValue={defaultDate}
                  required 
                  className="pl-11 h-12 rounded-xl border-slate-200/60 bg-slate-50/50 focus:bg-white focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Função Necessária</Label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  id="skill_id"
                  name="skill_id"
                  required
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-slate-200/60 bg-slate-50/50 pl-11 pr-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium appearance-none"
                >
                  <option value="">Selecione a função</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Membro Disponível</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  id="member_id"
                  name="member_id"
                  required
                  className="flex h-12 w-full rounded-xl border border-slate-200/60 bg-slate-50/50 pl-11 pr-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium appearance-none"
                >
                  <option value="">Selecione o membro</option>
                  {filteredMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedSkill && filteredMembers.length === 0 && (
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  Nenhum membro possui esta habilidade registrada.
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Confirmar Escala'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
