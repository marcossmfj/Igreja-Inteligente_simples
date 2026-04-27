import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Building2, Mail } from 'lucide-react'
import { createChurchFromMaster } from './actions'

export default async function MasterPanel() {
  const supabase = await createClient()
  
  // 1. Verificar se é Master
  const { data: profile } = await supabase.from('profiles').select('role').single()
  if (profile?.role !== 'master') {
    redirect('/')
  }

  // 2. Listar igrejas existentes
  const { data: churches } = await supabase
    .from('churches')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })

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
            <form action={createChurchFromMaster} className="space-y-4">
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
                <p className="text-[10px] text-muted-foreground italic">
                  * O usuário deve estar cadastrado no sistema para ser vinculado.
                </p>
              </div>
              <Button type="submit" className="w-full">Criar e Vincular</Button>
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
