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
import { Plus, Pencil, AlertCircle } from 'lucide-react'
import { addMember, updateMember } from './actions'

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
      <DialogTrigger
        render={
          isEditing ? (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Membro
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Membro' : 'Cadastrar Membro'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize os dados do membro da igreja.' 
              : 'Preencha os dados do novo membro da igreja.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center gap-2 border border-destructive/20 font-medium animate-in fade-in zoom-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="João Silva" 
              defaultValue={member?.name} 
              required 
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input 
              id="phone" 
              name="phone" 
              placeholder="(11) 99999-9999" 
              defaultValue={member?.phone || ''} 
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_id">Cargo</Label>
            <select
              id="role_id"
              name="role_id"
              defaultValue={member?.role_id || ''}
              disabled={loading}
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
                    defaultChecked={memberSkillIds.includes(skill.id)}
                    disabled={loading}
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? (isEditing ? 'Salvando...' : 'Cadastrando...') 
              : (isEditing ? 'Salvar Alterações' : 'Salvar Membro')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
