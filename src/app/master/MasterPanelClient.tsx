'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Mail, AlertCircle, LogOut, ShieldAlert, Edit2, CheckCircle2 } from 'lucide-react'
import { createChurchFromMaster, toggleChurchBlock, updateChurchName } from './actions'
import { useState } from 'react'
import { logout } from '@/app/login/actions'
import { Badge } from '@/components/ui/badge'

interface Church {
  id: string
  name: string
  is_blocked: boolean
  created_at: string
  profiles?: { email: string }[]
}

export default function MasterPanelClient({ churches }: { churches: Church[] }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const result = await createChurchFromMaster(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        const form = document.querySelector('form') as HTMLFormElement
        form?.reset()
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido'
      setError('Erro inesperado: ' + message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleBlock(church: Church) {
    if (!confirm(`Deseja realmente ${church.is_blocked ? 'DESBLOQUEAR' : 'BLOQUEAR'} o acesso desta igreja?`)) return
    const result = await toggleChurchBlock(church.id, church.is_blocked)
    if (result.error) alert(result.error)
  }

  async function handleUpdateName(id: string) {
    const result = await updateChurchName(id, editName)
    if (result.error) alert(result.error)
    else setEditingId(null)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Painel Master</h1>
          <p className="text-muted-foreground">Gerenciamento global de igrejas e acessos.</p>
        </div>
        <Button variant="ghost" onClick={() => logout()} className="text-muted-foreground hover:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </button>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Nome da Igreja</TableHead>
                  <TableHead>Admin Vinculado</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churches?.map((church) => (
                  <TableRow key={church.id} className={church.is_blocked ? 'bg-destructive/5' : ''}>
                    <TableCell>
                      {church.is_blocked ? (
                        <Badge variant="destructive">Bloqueada</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Ativa</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === church.id ? (
                        <div className="flex gap-2">
                          <input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 rounded border px-2 text-sm"
                          />
                          <Button size="icon-sm" onClick={() => handleUpdateName(church.id)}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-bold">{church.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {church.profiles?.[0]?.email || 'Nenhum admin'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          onClick={() => {
                            setEditingId(church.id)
                            setEditName(church.name)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          className={church.is_blocked ? 'text-green-600' : 'text-destructive'}
                          onClick={() => handleToggleBlock(church)}
                        >
                          <ShieldAlert className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
