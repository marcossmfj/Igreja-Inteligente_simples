'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, MessageSquare, User, Calendar, CheckCircle2 } from 'lucide-react'
import { deleteSchedule } from './actions'
import { cn } from '@/lib/utils'

interface ScheduleItem {
  id: string
  date: string
  event_name: string
  skills: { name: string } | null
  members: { id: string, name: string, phone: string | null } | null
}

interface GroupedSchedules {
  [date: string]: {
    date: string
    events: {
      [eventName: string]: ScheduleItem[]
    }
  }
}

const skillColors: Record<string, string> = {
  'Som': 'bg-blue-50 text-blue-600',
  'Louvor': 'bg-purple-50 text-purple-600',
  'Recepção': 'bg-emerald-50 text-emerald-600',
  'Mídia': 'bg-amber-50 text-amber-600',
  'Infantil': 'bg-pink-50 text-pink-600',
}

export function SchedulesClient({ groupedSchedules }: { groupedSchedules: GroupedSchedules }) {
  const [sentNotifications, setSentNotifications] = useState<Set<string>>(new Set())

  const handleNotify = (id: string, whatsappUrl: string) => {
    window.open(whatsappUrl, '_blank')
    setSentNotifications(prev => new Set(prev).add(id))
  }

  const dates = Object.values(groupedSchedules).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-10">
      {dates.map((dateGroup) => (
        <div key={dateGroup.date} className="space-y-6">
          <div className="flex items-center gap-4 px-4 md:px-0">
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                {new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
            </div>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="grid gap-6">
            {Object.entries(dateGroup.events).map(([eventName, items]) => (
              <Card key={eventName} className="border-slate-200/60 shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white border">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-3 text-xl">
                    {eventName}
                  </h3>
                  <Badge variant="outline" className="rounded-xl bg-white text-[10px] font-black border-slate-200 uppercase tracking-widest px-4 py-1.5 shadow-sm">
                    {items.length} Integrantes
                  </Badge>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {items.map((item) => {
                    const colorClass = skillColors[item.skills?.name || ''] || 'bg-slate-100 text-slate-500'
                    const isSent = sentNotifications.has(item.id)
                    
                    const cleanPhone = item.members?.phone?.replace(/\D/g, '') || ''
                    const message = `Olá *${item.members?.name}*, você está escalado para *${eventName}* no dia *${new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}* na função de *${item.skills?.name || 'Auxiliar'}*. Confirma presença?`
                    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`

                    return (
                      <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:px-10 hover:bg-slate-50/50 transition-all duration-300 gap-6">
                        <div className="flex items-center gap-6 flex-1">
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all duration-500 shrink-0">
                            <User className="h-7 w-7" />
                          </div>
                          <div className="space-y-1.5">
                            <p className="font-black text-slate-900 tracking-tight text-lg leading-none">
                              {item.members?.name}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge className={cn("rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-none shadow-none", colorClass)}>
                                {item.skills?.name || 'Auxiliar'}
                              </Badge>
                              {item.members?.phone && (
                                <span className="text-xs text-slate-300 font-bold tracking-tight">
                                  {item.members.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          {item.members?.phone && (
                            <Button
                              onClick={() => handleNotify(item.id, whatsappUrl)}
                              className={cn(
                                "flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl",
                                isSent 
                                  ? "bg-emerald-500 text-white shadow-emerald-100 hover:bg-emerald-600" 
                                  : "bg-slate-900 text-white shadow-slate-200 hover:bg-blue-600"
                              )}
                            >
                              {isSent ? (
                                <><CheckCircle2 className="h-4 w-4" /> Enviado</>
                              ) : (
                                <><MessageSquare className="h-4 w-4" /> Notificar</>
                              )}
                            </Button>
                          )}
                          <form action={deleteSchedule.bind(null, item.id)}>
                            <button 
                              type="submit" 
                              className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100/50"
                            >
                              <Trash2 className="h-5 w-5" />
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
        <div className="py-32 text-center bg-white border border-dashed border-slate-200 rounded-[3.5rem] mx-4 md:mx-0 shadow-sm animate-in fade-in duration-1000">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-slate-50 mb-8">
            <Calendar className="h-12 w-12 text-slate-200" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Sua escala está vazia</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mt-3 leading-relaxed">
            Comece a organizar os ministérios e eventos da sua igreja clicando no botão de nova escala.
          </p>
        </div>
      )}
    </div>
  )
}
