'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Trash2, 
  Filter,
  User
} from 'lucide-react'
import { MemberForm } from './MemberForm'
import { deleteMember } from './actions'
import { cn } from '@/lib/utils'

interface Member {
  id: string
  name: string
  phone: string | null
  role_id: string | null
  roles: { name: string } | null
  member_skills: { skill_id: string, skills: { name: string } | null }[]
}

export function MembersClient({ 
  initialMembers, 
  roles, 
  skills 
}: { 
  initialMembers: Member[],
  roles: any[],
  skills: any[]
}) {
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const filteredMembers = useMemo(() => {
    return initialMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                            member.roles?.name.toLowerCase().includes(search.toLowerCase())
      
      const matchesRole = !selectedRole || member.role_id === selectedRole
      
      return matchesSearch && matchesRole
    })
  }, [search, selectedRole, initialMembers])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input 
            placeholder="Buscar membros por nome ou cargo..." 
            className="pl-11 h-12 rounded-2xl border-slate-200/60 bg-white shadow-sm focus:ring-blue-500/10 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200/60">
            <Button 
              variant={!selectedRole ? "outline" : "ghost"} 
              size="sm" 
              className={cn("rounded-lg h-8 text-xs font-bold px-4 border-none", !selectedRole ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
              onClick={() => setSelectedRole(null)}
            >
              Todos
            </Button>
            {roles.slice(0, 3).map(role => (
              <Button 
                key={role.id}
                variant={selectedRole === role.id ? "outline" : "ghost"} 
                size="sm" 
                className={cn("rounded-lg h-8 text-xs font-bold px-4 border-none", selectedRole === role.id ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                onClick={() => setSelectedRole(role.id)}
              >
                {role.name}
              </Button>
            ))}
          </div>
          <MemberForm roles={roles} skills={skills} />
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Membro</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Habilidades</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{member.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{member.phone || 'Sem telefone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {member.roles?.name ? (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                          {member.roles.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {member.member_skills?.map((ms) => (
                          <Badge 
                            key={ms.skill_id} 
                            variant="outline" 
                            className="bg-blue-50/50 text-blue-600 border-blue-100/50 rounded-lg text-[10px] font-bold"
                          >
                            {ms.skills?.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {member.phone && (
                          <a 
                            href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`} 
                            target="_blank"
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        )}
                        <MemberForm roles={roles} skills={skills} member={member} />
                        <form action={deleteMember.bind(null, member.id)}>
                          <button type="submit" className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
          {filteredMembers.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-50 mb-4">
                <Search className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">Nenhum membro encontrado</p>
              <p className="text-xs text-slate-300 mt-1">Tente ajustar sua busca ou filtros</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
