'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MessageSquare, 
  Trash2, 
  User,
  FilterX
} from 'lucide-react'
import { MemberForm } from './MemberForm'
import { deleteMember } from './actions'
import { cn } from '@/lib/utils'

export interface Role {
  id: string
  name: string
}

export interface Skill {
  id: string
  name: string
}

export interface MemberSkill {
  skill_id: string
  skills: {
    name: string
  } | null
}

export interface Member {
  id: string
  name: string
  phone: string | null
  role_id: string | null
  roles: {
    name: string
  } | null
  member_skills: MemberSkill[]
}

interface MembersClientProps {
  initialMembers: Member[]
  roles: Role[]
  skills: Skill[]
}

export function MembersClient({ 
  initialMembers, 
  roles, 
  skills 
}: MembersClientProps) {
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const filteredMembers = useMemo(() => {
    return initialMembers.filter(member => {
      const searchLower = search.toLowerCase()
      const matchesSearch = member.name.toLowerCase().includes(searchLower) ||
                            (member.roles?.name.toLowerCase().includes(searchLower) ?? false) ||
                            member.phone?.includes(search)
      
      const matchesRole = !selectedRole || member.role_id === selectedRole
      
      const matchesSkill = !selectedSkill || 
                          member.member_skills.some(ms => ms.skill_id === selectedSkill)
      
      return matchesSearch && matchesRole && matchesSkill
    })
  }, [search, selectedRole, selectedSkill, initialMembers])

  const resetFilters = () => {
    setSelectedRole(null)
    setSelectedSkill(null)
    setSearch('')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Filtros e Busca */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Buscar por nome, cargo ou telefone..." 
              className="pl-11 h-14 rounded-2xl border-slate-200/60 bg-white shadow-sm focus:ring-blue-500/10 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            {(selectedRole || selectedSkill || search) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="rounded-xl h-10 text-slate-500 hover:text-red-500 gap-2"
              >
                <FilterX className="h-4 w-4" />
                Limpar
              </Button>
            )}
            <MemberForm roles={roles} skills={skills} />
          </div>
        </div>

        {/* Badges de Filtro Rápido */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Cargos:</span>
          <Button 
            variant={!selectedRole ? "default" : "outline"} 
            size="sm" 
            className={cn(
              "rounded-full h-8 text-[10px] font-bold px-4 transition-all",
              !selectedRole ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white text-slate-500 border-slate-200"
            )}
            onClick={() => setSelectedRole(null)}
          >
            TODOS
          </Button>
          {roles.map(role => (
            <Button 
              key={role.id}
              variant={selectedRole === role.id ? "default" : "outline"} 
              size="sm" 
              className={cn(
                "rounded-full h-8 text-[10px] font-bold px-4 transition-all uppercase tracking-wider",
                selectedRole === role.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-500 border-slate-200"
              )}
              onClick={() => setSelectedRole(role.id)}
            >
              {role.name}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Habilidades:</span>
          <Button 
            variant={!selectedSkill ? "default" : "outline"} 
            size="sm" 
            className={cn(
              "rounded-full h-8 text-[10px] font-bold px-4 transition-all",
              !selectedSkill ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-white text-slate-500 border-slate-200"
            )}
            onClick={() => setSelectedSkill(null)}
          >
            TODAS
          </Button>
          {skills.map(skill => (
            <Button 
              key={skill.id}
              variant={selectedSkill === skill.id ? "default" : "outline"} 
              size="sm" 
              className={cn(
                "rounded-full h-8 text-[10px] font-bold px-4 transition-all uppercase tracking-wider",
                selectedSkill === skill.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-500 border-slate-200"
              )}
              onClick={() => setSelectedSkill(skill.id)}
            >
              {skill.name}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white border">
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="min-w-[800px] lg:min-w-full">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Membro</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargo</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Habilidades</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[1.2rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all duration-500">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight leading-none mb-1.5">{member.name}</p>
                          <p className="text-xs text-slate-400 font-bold tracking-tight">{member.phone || 'Sem telefone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {member.roles?.name ? (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em]">
                          {member.roles.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-200 text-xs font-bold uppercase tracking-widest">Nenhum</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {member.member_skills?.map((ms) => (
                          <Badge 
                            key={ms.skill_id} 
                            variant="outline" 
                            className="bg-blue-50/30 text-blue-600 border-blue-100/50 rounded-lg text-[9px] font-black uppercase tracking-wider px-2"
                          >
                            {ms.skills?.name}
                          </Badge>
                        ))}
                        {member.member_skills.length === 0 && (
                          <span className="text-slate-200 text-xs font-bold uppercase tracking-widest">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        {member.phone && (
                          <a 
                            href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`} 
                            target="_blank"
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        )}
                        <MemberForm roles={roles} skills={skills} member={member} />
                        <form action={deleteMember.bind(null, member.id)}>
                          <button type="submit" className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100/50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          {filteredMembers.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-slate-50 mb-6">
                <Search className="h-10 w-10 text-slate-200" />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Nenhum membro encontrado</h4>
              <p className="text-slate-400 font-medium text-sm mt-2">Tente ajustar seus filtros ou busca.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
