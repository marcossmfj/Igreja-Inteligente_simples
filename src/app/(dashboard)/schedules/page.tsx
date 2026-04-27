import { createClient } from '@/utils/supabase/server'
import { deleteSchedule } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Calendar, MessageCircle } from 'lucide-react'
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
      members(id, name, phone)
    `)
    .order('date', { ascending: true })

  // Buscar dados para o formulário
  const { data: skills } = await supabase.from('skills').select('*').order('name')
  const { data: members } = await supabase
    .from('members')
    .select('id, name, member_skills(skill_id)')
    .order('name')

  // Agrupar escalas por data e evento
  const groupedSchedules = schedules?.reduce((acc: any, curr) => {
    const key = `${curr.date}_${curr.event_name}`
    if (!acc[key]) {
      acc[key] = {
        date: curr.date,
        event_name: curr.event_name,
        items: []
      }
    }
    acc[key].items.push(curr)
    return acc
  }, {})

  const groups = Object.values(groupedSchedules || {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Escalas</h2>
          <p className="text-muted-foreground">
            Organize quem servirá em cada culto por blocos de eventos.
          </p>
        </div>
        <ScheduleForm 
          skills={(skills as { id: string; name: string }[]) || []} 
          members={(members as unknown as { id: string; name: string; member_skills: { skill_id: string }[] }[]) || []} 
        />
      </div>

      <div className="space-y-8">
        {groups.map((group: any) => (
          <Card key={`${group.date}_${group.event_name}`} className="overflow-hidden border-primary/20">
            <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-primary font-bold">
                  <Calendar className="h-5 w-5 mr-2" />
                  {new Date(group.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </div>
                <div className="text-lg font-heading font-semibold text-gray-800">
                  {group.event_name}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-white">
                  {group.items.length} pessoas escaladas
                </Badge>
                <ScheduleForm 
                  skills={(skills as { id: string; name: string }[]) || []} 
                  members={(members as unknown as { id: string; name: string; member_skills: { skill_id: string }[] }[]) || []}
                  defaultValues={{ event_name: group.event_name, date: group.date }}
                />
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y">
                {group.items.map((item: any) => {
                  const whatsappUrl = item.members?.phone 
                    ? `https://wa.me/55${item.members.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá *${item.members.name}*! você está escalado para o *${group.event_name}* do dia *${new Date(group.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}* na função de *${item.skills?.name || 'Auxiliar'}*. Contamos com você!`
                      )}`
                    : null

                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="font-medium min-w-[150px]">{item.members?.name}</div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                          {item.skills?.name || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {whatsappUrl && (
                          <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-green-500 text-white hover:bg-green-600 h-9 px-3"
                            title="Enviar Escala por WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Enviar WhatsApp
                          </a>
                        )}
                        <form action={deleteSchedule.bind(null, item.id)}>
                          <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma escala para os próximos dias</h3>
            <p className="text-gray-500">Clique em "Criar Escala" para começar a organizar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
