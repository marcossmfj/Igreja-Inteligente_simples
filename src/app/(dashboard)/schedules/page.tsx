import { createClient } from '@/utils/supabase/server'
import { deleteSchedule } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Calendar } from 'lucide-react'
import { ScheduleForm } from './ScheduleForm'
import { Badge } from '@/components/ui/badge'

export default async function SchedulesPage() {
  const supabase = await createClient()
  
  // Buscar escalas futuras
  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      *,
      skills(name),
      members(name)
    `)
    .order('date', { ascending: true })

  // Buscar dados para o formulário
  const { data: skills } = await supabase.from('skills').select('*').order('name')
  const { data: members } = await supabase
    .from('members')
    .select('id, name, member_skills(skill_id)')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Escalas</h2>
          <p className="text-muted-foreground">
            Organize quem servirá em cada culto.
          </p>
        </div>
        <ScheduleForm 
          skills={skills || []} 
          members={(members as any) || []} 
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Membro</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {new Date(schedule.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{schedule.members?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {schedule.skills?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form action={deleteSchedule.bind(null, schedule.id)}>
                      <Button variant="ghost" size="icon" type="submit">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {schedules?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhuma escala agendada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
