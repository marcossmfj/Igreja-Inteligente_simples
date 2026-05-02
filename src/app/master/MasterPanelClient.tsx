'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Building2, Mail, AlertCircle, LogOut, ShieldAlert, 
  Plus, Users, TrendingUp, 
  DollarSign, Settings2, Trash2, Phone, ExternalLink, MoreVertical,
  ShieldCheck, Zap
} from 'lucide-react'
import { createChurchFromMaster, toggleChurchBlock, updateChurchSubscription, deleteChurchData } from './actions'
import { useState, useMemo } from 'react'
import { logout } from '@/app/login/actions'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Church {
  id: string
  name: string
  is_blocked: boolean
  created_at: string
  admin_name?: string
  admin_phone?: string
  admin_email?: string
  subscription_expires_at?: string
  plan_type?: 'trial' | 'mensal' | 'anual' | 'premium'
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'blocked' | 'canceled'
  max_members?: number
  internal_notes?: string
  member_count?: number
  schedule_count?: number
  visitor_count?: number
  profiles?: { email: string }[]
}

export default function MasterPanelClient({ churches }: { churches: any[] }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Métricas do Topo
  const stats = useMemo(() => {
    const active = churches.filter(c => !c.is_blocked).length
    const totalMembers = churches.reduce((acc, c) => acc + (c.member_count || 0), 0)
    const trialing = churches.filter(c => c.subscription_status === 'trialing').length
    const revenue = churches.reduce((acc, c) => {
      if (c.plan_type === 'mensal') return acc + 79.90
      if (c.plan_type === 'anual') return acc + 49.90
      return acc
    }, 0)

    return [
      { label: 'Igrejas Ativas', value: active, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Membros', value: totalMembers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Novos Trials', value: trialing, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'MRR Estimado', value: `R$ ${revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ]
  }, [churches])

  const filteredChurches = churches.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleCreateChurch(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createChurchFromMaster(formData)
    setLoading(false)
    if (result?.error) setError(result.error)
    else (document.querySelector('form') as HTMLFormElement)?.reset()
  }

  async function handleToggleBlock(church: Church) {
    if (!confirm(`Confirmar alteração de bloqueio para ${church.name}?`)) return
    await toggleChurchBlock(church.id, church.is_blocked)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Profissional */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-200">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Central Master</h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-50 text-blue-600 border-none rounded-md text-[10px] font-black uppercase tracking-widest px-2">v2.0 Admin</Badge>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Plataforma Igreja Inteligente</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => logout()}
              className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sair do Painel
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className={cn("p-4 rounded-2xl", s.bg)}>
                    <s.icon className={cn("h-6 w-6", s.color)} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-slate-200" />
                </div>
                <div className="mt-6 space-y-1">
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{s.label}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
          
          {/* Coluna Esquerda: Cadastro Rápido */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-500" /> Novo Cliente
                </CardTitle>
                <div className="text-sm text-slate-400 font-medium">Provisione uma nova igreja instantaneamente.</div>
              </CardHeader>
              <CardContent className="p-8 pt-2">
                <form action={handleCreateChurch} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Instituição</label>
                    <input name="churchName" placeholder="Nome da Igreja" className="w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admin Email</label>
                    <input name="adminEmail" type="email" placeholder="email@igreja.com" className="w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Senha Padrão</label>
                    <input name="adminPassword" type="password" placeholder="••••••••" className="w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" required />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                  >
                    {loading ? 'Criando...' : 'Finalizar Cadastro'}
                  </button>
                </form>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
          </div>

          {/* Coluna Direita: Listagem e Gestão */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
              <div className="relative w-full md:w-96 group">
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar igreja, email ou lead..."
                  className="w-full h-12 rounded-2xl border-slate-100 bg-white px-11 text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
                <Settings2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-10 px-4 rounded-xl bg-white border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-widest">{filteredChurches.length} Clientes</Badge>
              </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/30">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instituição & Lead</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Saúde / Uso</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano & Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredChurches.map((church) => {
                      const memberLimitPerc = ((church.member_count || 0) / (church.max_members || 50)) * 100
                      const isNearLimit = memberLimitPerc > 90

                      return (
                        <tr key={church.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                                  church.is_blocked ? "bg-red-50 text-red-400" : "bg-blue-50 text-blue-600"
                                )}>
                                  <Building2 className="h-5 w-5" />
                                </div>
                                <span className="font-black text-slate-900 text-base tracking-tight">{church.name}</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase ml-[52px]">
                                {church.admin_name || 'Sem Nome'} <span className="mx-2 opacity-30">•</span> {church.admin_email || 'Sem Email'}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="max-w-[120px] mx-auto space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase">
                                <span className={isNearLimit ? "text-red-500" : "text-slate-400"}>Membros</span>
                                <span className="text-slate-900">{church.member_count || 0}/{church.max_members || 50}</span>
                              </div>
                              <Progress value={memberLimitPerc} className={cn("h-1.5", isNearLimit ? "bg-red-100" : "bg-slate-100")} />
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  "border-none rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                                  church.plan_type === 'anual' ? "bg-purple-100 text-purple-600" :
                                  church.plan_type === 'mensal' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                )}>
                                  {church.plan_type || 'Trial'}
                                </Badge>
                                <span className={cn(
                                  "h-2 w-2 rounded-full",
                                  church.is_blocked ? "bg-red-400 animate-pulse" : "bg-emerald-400"
                                )} />
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                Expira: {church.subscription_expires_at ? new Date(church.subscription_expires_at).toLocaleDateString('pt-BR') : 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => setSelectedChurch(church)}
                              className="h-10 w-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all inline-flex items-center justify-center border border-slate-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Gestão Detalhada (Central) */}
      <Dialog open={!!selectedChurch} onOpenChange={() => setSelectedChurch(null)}>
        <DialogContent className="max-w-4xl w-[95vw] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          {selectedChurch && (
            <div className="flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="bg-slate-900 p-6 md:p-10 text-white shrink-0">
                <DialogHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 w-full">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 mt-1">
                          <Building2 className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                        </div>
                        <DialogTitle className="text-xl md:text-3xl font-black tracking-tighter uppercase break-words leading-tight pr-4">
                          {selectedChurch.name}
                        </DialogTitle>
                      </div>
                      <p className="text-slate-400 font-medium ml-[52px] md:ml-[60px] text-xs md:text-sm break-all">ID: {selectedChurch.id}</p>
                    </div>
                    <Badge className={cn("shrink-0", selectedChurch.is_blocked ? "bg-red-500" : "bg-emerald-500")}>
                      {selectedChurch.is_blocked ? 'BLOQUEADA' : 'ATIVA'}
                    </Badge>
                  </div>
                </DialogHeader>
              </div>

              <div className="p-6 md:p-10 space-y-10 bg-white">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const res = await updateChurchSubscription(selectedChurch.id, Object.fromEntries(formData))
                    if (res.success) setSelectedChurch(null)
                    else alert(res.error)
                  }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    
                    {/* Info Leads */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Informações do Responsável</h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nome Completo</label>
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                            <Users className="h-4 w-4 text-slate-300" />
                            <input 
                              name="admin_name" 
                              defaultValue={selectedChurch.admin_name} 
                              className="bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-none w-full"
                              placeholder="Nome do Pastor/Líder"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">WhatsApp</label>
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                            <Phone className="h-4 w-4 text-slate-300" />
                            <input 
                              name="admin_phone" 
                              defaultValue={selectedChurch.admin_phone} 
                              className="bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-none w-full"
                              placeholder="(00) 00000-0000"
                            />
                            <a href={`https://wa.me/${selectedChurch.admin_phone?.replace(/\D/g, '')}`} target="_blank" className="text-blue-600 hover:scale-110 transition-transform">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">E-mail de Contato</label>
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                            <Mail className="h-4 w-4 text-slate-300" />
                            <input 
                              name="admin_email" 
                              defaultValue={selectedChurch.admin_email || selectedChurch.profiles?.[0]?.email} 
                              className="bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-none w-full"
                              placeholder="email@contato.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Config Assinatura */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gestão de Licença</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Plano</label>
                            <select name="plan_type" defaultValue={selectedChurch.plan_type} className="w-full h-11 rounded-xl bg-slate-100 border-none text-xs font-bold px-3 focus:ring-2 focus:ring-blue-500/10 outline-none">
                              <option value="trial">Trial (Grátis)</option>
                              <option value="mensal">Mensal (R$ 79,90)</option>
                              <option value="anual">Anual (R$ 49,90)</option>
                              <option value="premium">Premium / Custom</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Limite Membros</label>
                            <input name="max_members" type="number" defaultValue={selectedChurch.max_members} className="w-full h-11 rounded-xl bg-slate-100 border-none text-xs font-bold px-3 focus:ring-2 focus:ring-blue-500/10 outline-none" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Expiração</label>
                          <input name="subscription_expires_at" type="date" defaultValue={selectedChurch.subscription_expires_at?.split('T')[0]} className="w-full h-11 rounded-xl bg-slate-100 border-none text-xs font-bold px-3 focus:ring-2 focus:ring-blue-500/10 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Status do SaaS</label>
                          <select name="subscription_status" defaultValue={selectedChurch.subscription_status} className="w-full h-11 rounded-xl bg-slate-100 border-none text-xs font-bold px-3 focus:ring-2 focus:ring-blue-500/10 outline-none">
                            <option value="trialing">Em Teste</option>
                            <option value="active">Ativo (Pago)</option>
                            <option value="past_due">Atrasado</option>
                            <option value="canceled">Cancelado</option>
                          </select>
                        </div>
                        <button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
                          Salvar Todas as Alterações
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="h-px bg-slate-100 w-full" />

                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleToggleBlock(selectedChurch)}
                      className={cn(
                        "px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                        selectedChurch.is_blocked ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                      )}
                    >
                      <ShieldAlert className="h-4 w-4" /> {selectedChurch.is_blocked ? 'Desbloquear Acesso' : 'Suspender Cliente'}
                    </button>
                  </div>
                  <button 
                    onClick={async () => {
                      if (confirm("ATENÇÃO: Isso apagará TODOS os dados dessa igreja (membros, escalas, etc). Deseja continuar?")) {
                        const res = await deleteChurchData(selectedChurch.id)
                        if (res.success) setSelectedChurch(null)
                      }
                    }}
                    className="px-6 py-4 rounded-2xl bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Apagar Dados
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
