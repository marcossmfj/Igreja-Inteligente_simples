'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, AlertCircle } from 'lucide-react'
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
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center gap-2 border border-destructive/20 font-medium animate-in fade-in zoom-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome</label>
          <Input name="name" placeholder="Nome do visitante" required disabled={loading} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">WhatsApp</label>
          <Input name="phone" placeholder="(11) 99999-9999" required disabled={loading} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Cadastrando...' : <><Plus className="h-4 w-4 mr-2" /> Cadastrar</>}
        </Button>
      </form>
    </div>
  )
}
