'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Mail, AlertCircle, LogOut, ShieldAlert, Edit2, CheckCircle2, Lock, Plus, Search, ShieldCheck } from 'lucide-react'
import { createChurchFromMaster, toggleChurchBlock, updateChurchName } from './actions'
import { useState } from 'react'
import { logout } from '@/app/login/actions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Church {
  id: string
  name: string
  is_blocked: boolean
  created_at: string
  profiles?: { email: string }[]
}

export default function MasterPanelClient({ churches }: { churches: Church[] }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      const result = await createChurchFromMaster(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        const form = document.querySelector('form') as HTMLFormElement
        form?.reset()
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido'
      setError('Erro inesperado: ' + message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleBlock(church: Church) {
    if (!confirm(`Deseja realmente ${church.is_blocked ? 'DESBLOQUEAR' : 'BLOQUEAR'} o acesso desta igreja?`)) return
    const result = await toggleChurchBlock(church.id, church.is_blocked)
    if (result.error) alert(result.error)
  }

  async function handleUpdateName(id: string) {
    const result = await updateChurchName(id, editName)
    if (result.error) alert(result.error)
    else setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Painel Master</h1>
              <Badge className="bg-amber-100 text-amber-700 border-none rounded-lg text-[10px] font-black uppercase tracking-widest px-3">Root Access</Badge>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Governança Global da Plataforma</p>
          </div>
          <button 
            onClick={() => logout()} 
            className="group flex items-center px-6 py-4 text-xs font-black uppercase tracking-widest text-red-400 bg-white border border-slate-100 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-xl shadow-slate-200/50"
          >
            <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Encerrar Sessão Master
          </button>
        </div>

        <div className="grid gap-12 lg:grid-cols-[450px_1fr]">
          {/* Formulário */}
          <div className="space-y-8">
            <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 pb-2">
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Nova Igreja</CardTitle>
                <CardDescription className="text-slate-400 font-medium font-medium">Provisionamento de nova instância.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-6">
                <form action={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 text-sm bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 font-bold animate-in fade-in zoom-in duration-300">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome da Igreja</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        name="churchName"
                        className="w-full pl-11 h-14 rounded-2xl border-slate-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
                        placeholder="Ex: Igreja Central"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">E-mail do Administrador</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        name="adminEmail"
                        type="email"
                        className="w-full pl-11 h-14 rounded-2xl border-slate-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
                        placeholder="pastor@igreja.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Senha Inicial</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        name="adminPassword"
                        type="password"
                        className="w-full pl-11 h-14 rounded-2xl border-slate-200/60 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50" 
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : <><Plus className="inline h-4 w-4 mr-2" /> Criar Igreja</>}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Listagem */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-slate-900 tracking-tight text-xl">Instâncias Ativas</h3>
              <Badge variant="outline" className="rounded-lg bg-slate-50 text-[10px] font-bold border-slate-100 uppercase tracking-widest px-3 py-1">
                {churches?.length} igrejas
              </Badge>
            </div>

            <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="min-w-[800px] lg:min-w-full">
                    <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Instituição</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrador</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Controles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {churches?.map((church) => (
                        <tr key={church.id} className={cn("group hover:bg-slate-50/50 transition-all duration-300", church.is_blocked && "bg-red-50/30")}>
                          <td className="px-8 py-6">
                            {church.is_blocked ? (
                              <Badge variant="destructive" className="bg-red-100 text-red-600 border-none rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                                Bloqueada
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                                Ativa
                              </Badge>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            {editingId === church.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  value={editName} 
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-10 rounded-xl border border-blue-200 px-4 text-sm font-bold bg-blue-50/30 focus:outline-none"
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handleUpdateName(church.id)}
                                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                                  <Building2 className="h-5 w-5" />
                                </div>
                                <span className="font-black text-slate-900 text-base">{church.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="text-sm font-medium">{church.profiles?.[0]?.email || 'Sem admin'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button 
                                onClick={() => {
                                  setEditingId(church.id)
                                  setEditName(church.name)
                                }}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl transition-all"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleToggleBlock(church)}
                                className={cn(
                                  "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                                  church.is_blocked 
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" 
                                    : "bg-red-50 text-red-500 hover:bg-red-600 hover:text-white"
                                )}
                              >
                                <ShieldAlert className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
