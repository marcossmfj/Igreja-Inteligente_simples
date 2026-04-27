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
import { Plus } from 'lucide-react'
import { addMember } from './actions'
import { Checkbox } from '@/components/ui/checkbox'

export function MemberForm({ roles, skills }: { roles: any[], skills: any[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Novo Membro
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Membro</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo membro da igreja.
          </DialogDescription>
        </DialogHeader>
        <form action={async (formData) => {
          await addMember(formData)
          setOpen(false)
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" name="name" placeholder="João Silva" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_id">Cargo</Label>
            <select
              id="role_id"
              name="role_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Selecione um cargo</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Habilidades</Label>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-32 overflow-y-auto">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`skill-${skill.id}`}
                    name="skills"
                    value={skill.id}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`skill-${skill.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {skill.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">Salvar Membro</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
