import { createClient } from '@/utils/supabase/server'
import { deleteSchedule } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Calendar, MessageSquare, User, Clock, MapPin } from 'lucide-react'
import { ScheduleForm } from './ScheduleForm'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const skillColors: Record<string, string> = {
  'Som': 'bg-blue-50 text-blue-600 border-blue-100',
  'Louvor': 'bg-purple-50 text-purple-600 border-purple-100',
  'Recepção': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Mídia': 'bg-amber-50 text-amber-600 border-amber-100',
  'Infantil': 'bg-pink-50 text-pink-600 border-pink-100',
}

export default async function SchedulesPage() {
  const supabase = await createClient()
  
  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      *,
      skills(name),
      members(id, name, phone)
    `)
    .order('date', { ascending: true })

  const { data: skills } = await supabase.from('skills').select('*').order('name')
  const { data: members } = await supabase
    .from('members')
    .select('id, name, member_skills(skill_id)')
    .order('name')

  const groupedSchedules = schedules?.reduce((acc: any, curr) => {
    const key = curr.date
    if (!acc[key]) {
      acc[key] = {
        date: curr.date,
        events: {}
      }
    }
    if (!acc[key].events[curr.event_name]) {
      acc[key].events[curr.event_name] = []
    }
    acc[key].events[curr.event_name].push(curr)
    return acc
  }, {})

  const dates = Object.values(groupedSchedules || {})

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Escalas</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Organização de Cultos</p>
        </div>
        <ScheduleForm 
          skills={(skills as any) || []} 
          members={(members as any) || []} 
        />
      </div>

      <div className="space-y-16">
        {dates.map((dateGroup: any) => (
          <div key={dateGroup.date} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-100 shadow-sm">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  {new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </div>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(dateGroup.events).map(([eventName, items]: [string, any]) => (
                <div key={eventName} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-900 tracking-tight">{eventName}</h3>
                    <Badge variant="outline" className="rounded-lg bg-slate-50 text-[10px] font-bold border-slate-100 uppercase tracking-widest">
                      {items.length} pessoas
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {items.map((item: any) => {
                      const colorClass = skillColors[item.skills?.name] || 'bg-slate-50 text-slate-600 border-slate-100'
                      const whatsappUrl = item.members?.phone 
                        ? `https://wa.me/55${item.members.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá *${item.members.name}*! você está escalado para o *${eventName}* do dia *${new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}* na função de *${item.skills?.name || 'Auxiliar'}*. Contamos com você!`
                          )}`
                        : null

                      return (
                        <Card key={item.id} className="group border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
                          <CardContent className="p-0">
                            <div className="p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <Badge className={cn("rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-none", colorClass)}>
                                  {item.skills?.name || 'Auxiliar'}
                                </Badge>
                                <form action={deleteSchedule.bind(null, item.id)}>
                                  <button type="submit" className="text-slate-200 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </form>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                  <User className="h-5 w-5" />
                                </div>
                                <div className="font-bold text-slate-900">{item.members?.name}</div>
                              </div>
                            </div>
                            {whatsappUrl && (
                              <a 
                                href={whatsappUrl} 
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all"
                              >
                                <MessageSquare className="h-3 w-3" /> Notificar WhatsApp
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {dates.length === 0 && (
          <div className="py-32 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-50 mb-6">
              <Calendar className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Tudo em ordem por aqui</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Você não possui escalas agendadas para os próximos dias.</p>
          </div>
        )}
      </div>
    </div>
  )
}
