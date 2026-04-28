import { createClient } from '@/utils/supabase/server'
import { ScheduleForm } from './ScheduleForm'
import { SchedulesClient } from './SchedulesClient'

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

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Escalas</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Programação Semanal</p>
        </div>
        <ScheduleForm 
          skills={(skills as any) || []} 
          members={(members as any) || []} 
        />
      </div>

      <SchedulesClient 
        groupedSchedules={groupedSchedules || {}} 
        skills={(skills as any) || []}
        members={(members as any) || []}
      />
    </div>
  )
}
