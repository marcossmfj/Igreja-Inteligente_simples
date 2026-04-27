import { createClient } from '@/utils/supabase/server'
import { deleteRole } from './actions'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, ShieldCheck, Search } from 'lucide-react'
import { RoleForm } from './RoleForm'
import { Badge } from '@/components/ui/badge'

export default async function RolesPage() {
  const supabase = await createClient()
  
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div className="flex flex-col gap-2">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Cargos</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Estrutura Hierárquica</p>
        </div>
        <RoleForm />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-900 tracking-tight text-xl">Funções Cadastradas</h3>
          <Badge variant="outline" className="rounded-lg bg-slate-50 text-[10px] font-bold border-slate-100 uppercase tracking-widest px-3 py-1">
            {roles?.length} registros
          </Badge>
        </div>

        <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargo / Função</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {roles?.map((role) => (
                    <tr key={role.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <span className="font-black text-slate-900 text-base">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <RoleForm role={role} />
                          <form action={deleteRole.bind(null, role.id)}>
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
            {roles?.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-50 mb-4">
                  <Search className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold">Nenhum cargo encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
