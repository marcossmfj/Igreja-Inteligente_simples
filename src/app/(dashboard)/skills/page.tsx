import { createClient } from '@/utils/supabase/server'
import { deleteSkill } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2 } from 'lucide-react'
import { SkillForm } from './SkillForm'

export default async function SkillsPage() {
  const supabase = await createClient()
  
  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Habilidades</h2>
          <p className="text-muted-foreground">
            Gerencie as habilidades (skills) para as escalas.
          </p>
        </div>
        <SkillForm />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills?.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="font-medium">{skill.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SkillForm skill={skill} />
                      <form action={deleteSkill.bind(null, skill.id)}>
                        <Button variant="ghost" size="icon" type="submit">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {skills?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    Nenhuma habilidade cadastrada.
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
