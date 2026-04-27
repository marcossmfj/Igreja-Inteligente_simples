'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Mail, AlertCircle } from 'lucide-react'
import { createChurchFromMaster } from './actions'
import { useState } from 'react'

export default function MasterPanelClient({ churches }: { churches: any[] }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const result = await createChurchFromMaster(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (e: any) {
      setError('Erro inesperado: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Painel Master</h1>
        <p className="text-muted-foreground">Gerenciamento global de igrejas e acessos.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[400px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nova Igreja</CardTitle>
            <CardDescription>Cadastre uma igreja e vincule um administrador.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center gap-2 border border-destructive/20 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Igreja</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    name="churchName"
                    className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Ex: Igreja Central"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail do Administrador</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    name="adminEmail"
                    type="email"
                    className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="email@dopastor.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha Inicial</label>
                <input
                  name="adminPassword"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Defina uma senha"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Igreja e Usuário'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Igrejas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Igreja</TableHead>
                  <TableHead>Admin Vinculado</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churches?.map((church) => (
                  <TableRow key={church.id}>
                    <TableCell className="font-bold">{church.name}</TableCell>
                    <TableCell>
                      {church.profiles?.[0]?.email || 'Nenhum admin'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(church.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {churches?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground italic">
                      Nenhuma igreja cadastrada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
