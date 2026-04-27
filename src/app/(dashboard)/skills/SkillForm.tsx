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
import { Plus, Pencil, AlertCircle } from 'lucide-react'
import { addSkill, updateSkill } from './actions'

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
      <DialogTrigger
        render={
          isEditing ? (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Habilidade
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Habilidade' : 'Adicionar Habilidade'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize o nome da habilidade.' 
              : 'Informe o nome da nova habilidade para sua igreja.'}
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
            <Label htmlFor="name">Nome da Habilidade</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Ex: Guitarrista, Pregador, Som" 
              defaultValue={skill?.name} 
              required 
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? (isEditing ? 'Salvando...' : 'Adicionando...') 
              : (isEditing ? 'Salvar Alterações' : 'Adicionar Habilidade')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
