import { createClient } from '@/utils/supabase/server'
import { deleteVisitor } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, MessageSquare, Heart, TrendingUp, Calendar } from 'lucide-react'
import { VisitorForm } from './VisitorForm'
import { Badge } from '@/components/ui/badge'

export default async function VisitorsPage() {
  const supabase = await createClient()
  
  const { data: visitors } = await supabase
    .from('visitors')
    .select('*')
    .order('visit_date', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 px-4 md:px-0">
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Visitantes</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Crescimento e Acolhimento</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 px-4 md:px-0">
        <div className="lg:col-span-4">
          <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/40 rounded-3xl lg:rounded-[2.5rem] bg-white overflow-hidden sticky top-32 border">
            <CardHeader className="p-6 md:p-10 pb-2">
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Nova Visita</CardTitle>
              <p className="text-slate-400 font-medium text-sm mt-1">Registre quem esteve presente hoje.</p>
            </CardHeader>
            <CardContent className="p-6 md:p-10 pt-6">
              <VisitorForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {visitors && visitors.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-900 tracking-tight text-xl">Histórico Recente</h3>
                <Badge variant="outline" className="rounded-xl bg-slate-50 text-[10px] font-black border-slate-200 uppercase tracking-widest px-4 py-1.5 shadow-sm">
                  {visitors.length} registros
                </Badge>
              </div>
              
              <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-3xl lg:rounded-[2.5rem] overflow-hidden bg-white border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="min-w-[800px] lg:min-w-full">
                      <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data da Visita</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nome do Visitante</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {visitors.map((visitor) => {
                          const cleanPhone = visitor.phone.replace(/\D/g, '')
                          const message = encodeURIComponent(`Olá, *${visitor.name}*!\n\nQue alegria ter você conosco em nossa igreja!\n\nEsperamos que tenha se sentido em casa e que a mensagem tenha falado ao seu coração.\n\nSe precisar de qualquer coisa ou quiser saber mais sobre nossas atividades, estamos aqui para te acolher. Deus te abençoe muito!`)
                          const waLink = `https://wa.me/55${cleanPhone}?text=${message}`

                          return (
                            <tr key={visitor.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <Calendar className="h-5 w-5" />
                                  </div>
                                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                    {new Date(visitor.visit_date).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <p className="font-black text-slate-900 tracking-tight leading-none mb-1.5">{visitor.name}</p>
                                <p className="text-xs text-slate-400 font-bold tracking-tight">{visitor.phone}</p>
                              </td>
                              <td className="px-4 md:px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 translate-x-0 lg:translate-x-2 lg:group-hover:translate-x-0">
                                  <a 
                                    href={waLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </a>
                                  <form action={deleteVisitor.bind(null, visitor.id)}>
                                    <button type="submit" className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100/50">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white border border-dashed border-slate-200 rounded-[3.5rem] animate-in fade-in zoom-in duration-1000 shadow-sm">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-[3rem] bg-blue-50 mb-10 shadow-inner">
                <TrendingUp className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">Sua igreja está crescendo?</h3>
              <p className="text-slate-400 font-medium max-w-sm mb-10 leading-relaxed text-lg">
                Registre visitantes para acompanhamento premium. Garanta que cada pessoa se sinta especial.
              </p>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Heart className="h-5 w-5 text-red-400 animate-pulse" />
                </div>
                &quot;Acolhei-vos uns aos outros, como Cristo nos acolheu&quot;
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
