import { createClient } from '@/utils/supabase/server'
import { deleteVisitor } from './actions'
import { Button } from '@/components/ui/button'
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
    <div className="max-w-7xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Visitantes</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Crescimento e Acolhimento</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] bg-white overflow-hidden sticky top-10">
            <CardHeader className="p-10 pb-2">
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Nova Visita</CardTitle>
              <p className="text-slate-400 font-medium text-sm mt-1">Registre quem esteve presente.</p>
            </CardHeader>
            <CardContent className="p-10 pt-6">
              <VisitorForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {visitors && visitors.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-900 tracking-tight text-xl">Histórico Recente</h3>
                <Badge variant="outline" className="rounded-lg bg-slate-50 text-[10px] font-bold border-slate-100 uppercase tracking-widest px-3 py-1">
                  {visitors.length} registros
                </Badge>
              </div>
              
              <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visitante</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {visitors.map((visitor) => {
                          const cleanPhone = visitor.phone.replace(/\D/g, '')
                          const message = encodeURIComponent(`Olá ${visitor.name}, foi um prazer ter você conosco em nossa igreja! Esperamos te ver novamente em breve.`)
                          const waLink = `https://wa.me/55${cleanPhone}?text=${message}`

                          return (
                            <tr key={visitor.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-4 w-4 text-slate-300" />
                                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    {new Date(visitor.visit_date).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <p className="font-black text-slate-900 leading-none mb-1">{visitor.name}</p>
                                <p className="text-xs text-slate-400 font-medium">{visitor.phone}</p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <a 
                                    href={waLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </a>
                                  <form action={deleteVisitor.bind(null, visitor.id)}>
                                    <button type="submit" className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white border border-dashed border-slate-200 rounded-[3rem] animate-in fade-in zoom-in duration-1000">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-[3rem] bg-blue-50 mb-10 shadow-inner">
                <TrendingUp className="h-16 w-16 text-blue-500" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Sua igreja está crescendo?</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed text-lg">
                Registre os visitantes para garantir um acolhimento especial e acompanhamento personalizado.
              </p>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400 text-sm">
                <Heart className="h-4 w-4 text-red-400" /> "Acolhei-vos uns aos outros, como Cristo nos acolheu"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
