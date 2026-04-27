import { createClient } from '@/utils/supabase/server'
import { deleteSchedule } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Calendar, MessageSquare, User, Clock, ChevronRight } from 'lucide-react'
import { ScheduleForm } from './ScheduleForm'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const skillColors: Record<string, string> = {
  'Som': 'bg-blue-50 text-blue-600',
  'Louvor': 'bg-purple-50 text-purple-600',
  'Recepção': 'bg-emerald-50 text-emerald-600',
  'Mídia': 'bg-amber-50 text-amber-600',
  'Infantil': 'bg-pink-50 text-pink-600',
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
    <div className="max-w-5xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Escalas</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Programação Semanal</p>
        </div>
        <ScheduleForm 
          skills={(skills as any) || []} 
          members={(members as any) || []} 
        />
      </div>

      <div className="space-y-10">
        {dates.map((dateGroup: any) => (
          <div key={dateGroup.date} className="space-y-4">
            {/* Header da Data */}
            <div className="flex items-center gap-4 px-4 md:px-0">
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  {new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </div>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Lista de Eventos e Pessoas */}
            <div className="space-y-6">
              {Object.entries(dateGroup.events).map(([eventName, items]: [string, any]) => (
                <Card key={eventName} className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
                  <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2 text-lg">
                      {eventName}
                    </h3>
                    <Badge variant="outline" className="rounded-lg bg-white text-[10px] font-bold border-slate-100 uppercase tracking-widest px-3">
                      {items.length} Integrantes
                    </Badge>
                  </div>
                  
                  <div className="divide-y divide-slate-50">
                    {items.map((item: any) => {
                      const colorClass = skillColors[item.skills?.name] || 'bg-slate-50 text-slate-500'
                      const whatsappUrl = item.members?.phone 
                        ? `https://wa.me/55${item.members.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá *${item.members.name}*! você está escalado para o *${eventName}* do dia *${new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}* na função de *${item.skills?.name || 'Auxiliar'}*. Contamos com você!`
                          )}`
                        : null

                      return (
                        <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:px-8 hover:bg-slate-50/50 transition-all duration-300 gap-4">
                          <div className="flex items-center gap-5 flex-1">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all duration-500 shrink-0">
                              <User className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-slate-900 tracking-tight text-base leading-none">
                                {item.members?.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className={cn("rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-none shadow-none", colorClass)}>
                                  {item.skills?.name || 'Auxiliar'}
                                </Badge>
                                {item.members?.phone && (
                                  <span className="text-[10px] text-slate-300 font-medium tracking-tight">
                                    • {item.members.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {whatsappUrl && (
                              <a 
                                href={whatsappUrl} 
                                target="_blank"
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                              >
                                <MessageSquare className="h-3.5 w-3.5" /> Notificar
                              </a>
                            )}
                            <form action={deleteSchedule.bind(null, item.id)}>
                              <button 
                                type="submit" 
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100/50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </form>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {dates.length === 0 && (
          <div className="py-32 text-center bg-white border border-dashed border-slate-200 rounded-[3rem] mx-4 md:mx-0">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-slate-50 mb-6">
              <Calendar className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Nenhuma escala definida</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Clique no botão acima para começar a organizar sua equipe.</p>
          </div>
        )}
      </div>
    </div>
  )
}
