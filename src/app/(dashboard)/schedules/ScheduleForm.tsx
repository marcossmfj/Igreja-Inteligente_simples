'use client'

import { useState, useMemo } from 'react'
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
import { Plus } from 'lucide-react'
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

export function ScheduleForm({ skills, members }: { skills: Skill[], members: Member[] }) {
  const [open, setOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState('')

  // Filtrar membros que possuem a skill selecionada
  const filteredMembers = useMemo(() => {
    if (!selectedSkill) return members
    return members.filter(member => 
      member.member_skills.some(ms => ms.skill_id === selectedSkill)
    )
  }, [selectedSkill, members])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Criar Escala
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Escala</DialogTitle>
          <DialogDescription>
            Selecione a função e o sistema mostrará apenas os membros qualificados.
          </DialogDescription>
        </DialogHeader>
        <form action={async (formData) => {
          await addSchedule(formData)
          setOpen(false)
          setSelectedSkill('')
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data do Culto</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skill_id">Função Necessária (Skill)</Label>
            <select
              id="skill_id"
              name="skill_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              required
            >
              <option value="">Selecione a função...</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member_id">Membro Escalado</Label>
            <select
              id="member_id"
              name="member_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">
                {selectedSkill 
                  ? `${filteredMembers.length} membros qualificados encontrados` 
                  : "Selecione a função primeiro"}
              </option>
              {filteredMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {selectedSkill && filteredMembers.length === 0 && (
              <p className="text-xs text-destructive mt-1">
                Aviso: Nenhum membro possui esta habilidade cadastrada.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">Agendar na Escala</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
