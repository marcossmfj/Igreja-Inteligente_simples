'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, AlertCircle } from 'lucide-react'
import { addRole } from './actions'

export function RoleForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await addRole(formData)
    setLoading(false)
    
    if (result?.error) {
      setError(result.error)
    } else {
      // Limpar o formulário se deu certo (hack simples para resetar o input sem refs complexas)
      const form = document.querySelector('form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center gap-2 border border-destructive/20 font-medium animate-in fade-in zoom-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <form action={handleSubmit} className="flex gap-2">
        <input
          name="name"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ex: Pastor, Diácono..."
          required
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Adicionando...' : <><Plus className="h-4 w-4 mr-2" /> Adicionar</>}
        </Button>
      </form>
    </div>
  )
}
