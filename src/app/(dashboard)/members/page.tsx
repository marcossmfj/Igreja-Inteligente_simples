import { createClient } from '@/utils/supabase/server'
import { MembersClient, Member, Role, Skill } from './MembersClient'

export default async function MembersPage() {
  const supabase = await createClient()
  
  // Buscar membros com cargo e habilidades
  const { data: members } = await supabase
    .from('members')
    .select(`
      id,
      name,
      phone,
      role_id,
      roles(name),
      member_skills(skill_id, skills(name))
    `)
    .order('name')

  // Buscar dados para o formulário
  const { data: roles } = await supabase.from('roles').select('id, name').order('name')
  const { data: skills } = await supabase.from('skills').select('id, name').order('name')

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10">
      <div className="flex flex-col gap-2 px-4 md:px-0">
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Membros</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Gestão de Comunidade</p>
      </div>

      <MembersClient 
        initialMembers={(members as unknown as Member[]) || []} 
        roles={(roles as Role[]) || []} 
        skills={(skills as Skill[]) || []} 
      />
    </div>
  )
}
