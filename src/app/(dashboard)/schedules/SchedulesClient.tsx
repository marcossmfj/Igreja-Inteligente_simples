'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Trash2, 
  MessageSquare, 
  User, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  SendHorizontal,
  PlayCircle
} from 'lucide-react'
import { deleteSchedule } from './actions'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

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

type NotificationStatus = 'waiting' | 'processing' | 'completed' | 'error'

const skillColors: Record<string, string> = {
  'Som': 'bg-blue-50 text-blue-600',
  'Louvor': 'bg-purple-50 text-purple-600',
  'Recepção': 'bg-emerald-50 text-emerald-600',
  'Mídia': 'bg-amber-50 text-amber-600',
  'Infantil': 'bg-pink-50 text-pink-600',
}

export function SchedulesClient({ groupedSchedules }: { groupedSchedules: GroupedSchedules }) {
  const [statuses, setStatuses] = useState<Record<string, NotificationStatus>>({})
  const [isQueueRunning, setIsQueueRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  // Lista plana de todos os membros escalados para a fila
  const allSchedules = useMemo(() => {
    const list: (ScheduleItem & { formattedDate: string })[] = []
    Object.values(groupedSchedules).forEach(dateGroup => {
      Object.values(dateGroup.events).forEach(eventItems => {
        eventItems.forEach(item => {
          list.push({
            ...item,
            formattedDate: new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          })
        })
      })
    })
    return list
  }, [groupedSchedules])

  const updateStatus = (id: string, status: NotificationStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  const sendNotification = (item: any, date: string) => {
    const phone = item.members?.phone || ''
    const name = item.members?.name || ''
    const role = item.skills?.name || 'Auxiliar'
    
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      updateStatus(item.id, 'error')
      return false
    }

    const msg = encodeURIComponent(`Olá ${name}, você está escalado para ${role} no dia ${date}. Confirma?`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    updateStatus(item.id, 'completed')
    return true
  }

  const startBatchNotification = async () => {
    if (isQueueRunning) return
    setIsQueueRunning(true)
    setProgress(0)

    for (let i = 0; i < allSchedules.length; i++) {
      const item = allSchedules[i]
      updateStatus(item.id, 'processing')
      
      // Pequeno delay visual
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const success = sendNotification(item, item.formattedDate)
      
      if (!success) {
        updateStatus(item.id, 'error')
      }

      const currentProgress = ((i + 1) / allSchedules.length) * 100
      setProgress(currentProgress)

      // Aguarda 2 segundos antes do próximo (conforme requisito)
      if (i < allSchedules.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    setIsQueueRunning(false)
  }

  const dates = Object.values(groupedSchedules).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Botão Mestre e Progresso */}
      {allSchedules.length > 0 && (
        <Card className="border-none shadow-2xl shadow-blue-100/50 rounded-[2.5rem] bg-white overflow-hidden border">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fila de Notificação</h3>
                <p className="text-slate-400 font-medium text-sm">
                  Dispare avisos para todos os {allSchedules.length} voluntários automaticamente.
                </p>
              </div>
              <Button 
                onClick={startBatchNotification}
                disabled={isQueueRunning}
                className={cn(
                  "h-16 px-8 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl gap-3",
                  isQueueRunning 
                    ? "bg-slate-100 text-slate-400" 
                    : "bg-blue-600 text-white hover:bg-slate-900 shadow-blue-200"
                )}
              >
                {isQueueRunning ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Processando Fila...</>
                ) : (
                  <><PlayCircle className="h-6 w-6" /> Notificar Todos via WhatsApp</>
                )}
              </Button>
            </div>
            
            {isQueueRunning && (
              <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-600">
                  <span>Progresso da Automação</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-blue-50" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                    const status = statuses[item.id] || 'waiting'
                    const formattedDate = new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                    const roleName = item.skills?.name || 'Auxiliar'

                    return (
                      <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:px-10 hover:bg-slate-50/50 transition-all duration-300 gap-6">
                        <div className="flex items-center gap-6 flex-1">
                          <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0",
                            status === 'processing' ? "bg-blue-100 text-blue-600 animate-pulse" :
                            status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                            status === 'error' ? "bg-red-100 text-red-600" :
                            "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                          )}>
                            {status === 'processing' ? <Loader2 className="h-7 w-7 animate-spin" /> :
                             status === 'completed' ? <CheckCircle2 className="h-7 w-7" /> :
                             status === 'error' ? <AlertTriangle className="h-7 w-7" /> :
                             <User className="h-7 w-7" />}
                          </div>
                          <div className="space-y-1.5">
                            <p className="font-black text-slate-900 tracking-tight text-lg leading-none">
                              {item.members?.name}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge className={cn("rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-none shadow-none", colorClass)}>
                                {roleName}
                              </Badge>
                              {item.members?.phone && (
                                <span className="text-xs text-slate-300 font-bold tracking-tight">
                                  {item.members.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          {status === 'waiting' && (
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                              {item.members?.phone && (
                                <Button
                                  onClick={() => sendNotification(item, formattedDate)}
                                  className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200"
                                >
                                  <MessageSquare className="h-4 w-4" /> Notificar
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
                          )}
                          
                          {status === 'processing' && (
                            <Badge className="bg-blue-50 text-blue-600 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest animate-pulse">
                              Processando...
                            </Badge>
                          )}

                          {status === 'completed' && (
                            <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest gap-2">
                              <CheckCircle2 className="h-3 w-3" /> Concluído ✅
                            </Badge>
                          )}

                          {status === 'error' && (
                            <Badge className="bg-red-50 text-red-600 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest gap-2">
                              <AlertTriangle className="h-3 w-3" /> Telefone Inválido ⚠️
                            </Badge>
                          )}
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
