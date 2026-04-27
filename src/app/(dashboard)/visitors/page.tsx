import { createClient } from '@/utils/supabase/server'
import { deleteVisitor } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, MessageCircle } from 'lucide-react'
import { VisitorForm } from './VisitorForm'

export default async function VisitorsPage() {
  const supabase = await createClient()
  
  const { data: visitors } = await supabase
    .from('visitors')
    .select('*')
    .order('visit_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visitantes</h2>
          <p className="text-muted-foreground">
            Acompanhe as pessoas que visitaram sua igreja.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Novo Visitante</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitorForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Histórico de Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors?.map((visitor) => {
                  const cleanPhone = visitor.phone.replace(/\D/g, '')
                  const message = encodeURIComponent(`Olá ${visitor.name}, foi um prazer ter você conosco em nossa igreja! Esperamos te ver novamente em breve.`)
                  const waLink = `https://wa.me/55${cleanPhone}?text=${message}`

                  return (
                    <TableRow key={visitor.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(visitor.visit_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{visitor.name}</TableCell>
                      <TableCell>{visitor.phone}</TableCell>
                      <TableCell className="flex gap-2">
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-green-600">
                            <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                          </Button>
                        </a>
                        <form action={deleteVisitor.bind(null, visitor.id)}>
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {visitors?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum visitante registrado.
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
