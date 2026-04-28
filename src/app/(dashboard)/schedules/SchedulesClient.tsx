'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
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
  PlayCircle,
  Plus
} from 'lucide-react'
import { deleteSchedule, markAsNotified, updateScheduleStatus } from './actions'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { ScheduleForm } from './ScheduleForm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ScheduleItem {
  id: string
  date: string
  event_name: string
  notified_at: string | null
  status: 'pendente' | 'confirmado' | 'recusado'
  skill_id: string
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

interface Skill {
  id: string
  name: string
}

interface Member {
  id: string
  name: string
  member_skills: { skill_id: string }[]
}

const skillColors: Record<string, string> = {
  'Som': 'bg-blue-50 text-blue-600',
  'Louvor': 'bg-purple-50 text-purple-600',
  'Recepção': 'bg-emerald-50 text-emerald-600',
  'Mídia': 'bg-amber-50 text-amber-600',
  'Infantil': 'bg-pink-50 text-pink-600',
}

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-slate-100 text-slate-500', icon: User },
  confirmado: { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
  recusado: { label: 'Recusado', color: 'bg-red-100 text-red-600', icon: AlertTriangle },
}

export function SchedulesClient({ 
  groupedSchedules,
  skills,
  members
}: { 
  groupedSchedules: GroupedSchedules,
  skills: Skill[],
  members: Member[]
}) {
  const dates = Object.values(groupedSchedules).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {dates.map((dateGroup) => (
        <div key={dateGroup.date} className="space-y-6">
          {/* Header da Data */}
          <div className="flex items-center gap-4 px-4 md:px-0">
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
                {new Date(dateGroup.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
            </div>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="grid gap-8">
            {Object.entries(dateGroup.events).map(([eventName, items]) => (
              <ScheduleEventCard 
                key={eventName} 
                eventName={eventName} 
                items={items} 
                date={dateGroup.date} 
                skills={skills}
                members={members}
              />
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

function ScheduleEventCard({ 
  eventName, 
  items, 
  date,
  skills,
  members 
}: { 
  eventName: string, 
  items: ScheduleItem[], 
  date: string,
  skills: Skill[],
  members: Member[]
}) {
  const [statuses, setStatuses] = useState<Record<string, 'waiting' | 'processing' | 'completed' | 'error'>>({})
  const [isQueueRunning, setIsQueueRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const updateUIStatus = (id: string, status: any) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  const handleStatusChange = async (id: string, newStatus: string | null) => {
    if (!newStatus) return
    await updateScheduleStatus(id, newStatus as any)
  }

  const sendNotification = async (item: ScheduleItem) => {
    const phone = item.members?.phone || ''
    const name = item.members?.name || ''
    const role = item.skills?.name || 'Auxiliar'
    
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      updateUIStatus(item.id, 'error')
      return false
    }

    const formattedDate = new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long' })
    const msg = encodeURIComponent(`Paz do Senhor, *${name}*!\n\nVocê foi escalado para servir como *${role}* no evento *"${eventName}"* no dia *${formattedDate}*.\n\nPodemos contar com sua presença?`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    
    // Marcar como notificado no banco
    await markAsNotified(item.id)
    updateUIStatus(item.id, 'completed')
    return true
  }

  const startBatchNotification = async () => {
    if (isQueueRunning) return
    setIsQueueRunning(true)
    setProgress(0)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      updateUIStatus(item.id, 'processing')
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const success = await sendNotification(item)
      if (!success) updateUIStatus(item.id, 'error')

      const currentProgress = ((i + 1) / items.length) * 100
      setProgress(currentProgress)

      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    setIsQueueRunning(false)
  }

  return (
    <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white border">
      {/* Header do Evento com Botão de Notificação */}
      <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-black text-slate-900 tracking-tight text-xl uppercase">
              {eventName}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-xl bg-white text-[10px] font-black border-slate-200 uppercase tracking-widest px-4 py-1.5 shadow-sm">
                {items.length} Integrantes
              </Badge>
              
              <ScheduleForm 
                skills={skills} 
                members={members}
                defaultEventName={eventName}
                defaultDate={date}
                trigger={
                  <button className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 group">
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  </button>
                }
              />
            </div>
          </div>
          
          <Button 
            onClick={startBatchNotification}
            disabled={isQueueRunning}
            size="sm"
            className={cn(
              "h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg gap-2",
              isQueueRunning 
                ? "bg-slate-100 text-slate-400" 
                : "bg-blue-600 text-white hover:bg-slate-900 shadow-blue-100"
            )}
          >
            {isQueueRunning ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> {Math.round(progress)}%</>
            ) : (
              <><PlayCircle className="h-4 w-4" /> Notificar Grupo</>
            )}
          </Button>
        </div>
        
        {isQueueRunning && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <Progress value={progress} className="h-1.5 bg-blue-50" />
          </div>
        )}
      </div>
      
      <div className="divide-y divide-slate-50">
        {items.map((item) => {
          const colorClass = skillColors[item.skills?.name || ''] || 'bg-slate-100 text-slate-500'
          const uiStatus = statuses[item.id] || 'waiting'
          const roleName = item.skills?.name || 'Auxiliar'
          const currentStatusConfig = statusConfig[item.status] || statusConfig.pendente
          const StatusIcon = currentStatusConfig.icon

          return (
            <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:px-10 hover:bg-slate-50/50 transition-all duration-300 gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 shadow-sm",
                  uiStatus === 'processing' ? "bg-blue-100 text-blue-600 animate-pulse" :
                  currentStatusConfig.color
                )}>
                  {uiStatus === 'processing' ? <Loader2 className="h-7 w-7 animate-spin" /> :
                    <StatusIcon className="h-7 w-7" />}
                </div>
                <div className="space-y-1.5">
                  <p className="font-black text-slate-900 tracking-tight text-lg leading-none">
                    {item.members?.name}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-none shadow-none", colorClass)}>
                      {roleName}
                    </Badge>
                    {item.notified_at && (
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        <MessageSquare className="h-2.5 w-2.5" />
                        Enviado em {new Date(item.notified_at).toLocaleDateString('pt-BR')} {new Date(item.notified_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center">
                {/* Seletor de Status de Presença - SEMPRE VISÍVEL */}
                <div className="flex items-center gap-2">
                  <Select value={item.status} onValueChange={(val) => handleStatusChange(item.id, val)}>
                    <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest h-10 shadow-sm hover:border-blue-500 transition-all">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="recusado">Recusado</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Opção de Substituir se estiver Recusado */}
                  {item.status === 'recusado' && (
                    <ScheduleForm 
                      skills={skills}
                      members={members}
                      defaultEventName={eventName}
                      defaultDate={date}
                      defaultSkillId={item.skill_id}
                      trigger={
                        <Button variant="outline" className="h-10 px-4 rounded-xl border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                          Substituir
                        </Button>
                      }
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {uiStatus === 'waiting' && item.members?.phone && (
                    <div className="opacity-0 group-hover:opacity-100 transition-all">
                      <Button
                        onClick={() => sendNotification(item)}
                        className="flex items-center gap-2 h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200"
                      >
                        <MessageSquare className="h-4 w-4" /> Notificar
                      </Button>
                    </div>
                  )}
                  
                  {uiStatus === 'processing' && (
                    <Badge className="bg-blue-50 text-blue-600 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest animate-pulse h-10 flex items-center">
                      Processando...
                    </Badge>
                  )}

                  <form action={deleteSchedule.bind(null, item.id)}>
                    <button 
                      type="submit" 
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100/50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
