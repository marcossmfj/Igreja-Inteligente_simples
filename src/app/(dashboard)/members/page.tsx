import { createClient } from '@/utils/supabase/server'
import { deleteMember } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Phone } from 'lucide-react'
import { MemberForm } from './MemberForm'
import { Badge } from '@/components/ui/badge'

export default async function MembersPage() {
  const supabase = await createClient()
  
  // Buscar membros com cargo
  const { data: members } = await supabase
    .from('members')
    .select(`
      *,
      roles(name),
      member_skills(skill_id, skills(name))
    `)
    .order('name')

  // Buscar dados para o formulário
  const { data: roles } = await supabase.from('roles').select('*').order('name')
  const { data: skills } = await supabase.from('skills').select('*').order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Membros</h2>
          <p className="text-muted-foreground">
            Gerencie o cadastro de membros da sua congregação.
          </p>
        </div>
        <MemberForm roles={roles || []} skills={skills || []} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Habilidades</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    {member.roles?.name || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.member_skills?.map((ms: { skill_id: string; skills: { name: string } | null }) => (
                        <Badge key={ms.skill_id} variant="secondary">
                          {ms.skills?.name}
                        </Badge>
                      ))}
                      {member.member_skills?.length === 0 && (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.phone ? (
                      <a 
                        href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`} 
                        target="_blank"
                        className="flex items-center text-green-600 hover:underline"
                      >
                        <Phone className="h-4 w-4 mr-1" /> {member.phone}
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MemberForm 
                        roles={roles || []} 
                        skills={skills || []} 
                        member={member} 
                      />
                      <form action={deleteMember.bind(null, member.id)}>
                        <Button variant="ghost" size="icon" type="submit">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {members?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum membro encontrado.
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
