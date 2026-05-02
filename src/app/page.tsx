'use client'

import { useState } from 'react'
import { CheckCircle2, ArrowRight, Calendar, Users, MessageSquare, Zap, ShieldCheck, Heart, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { registerChurch } from './actions'

export default function LandingPage() {
  const whatsappUrl = "https://wa.me/5511999999999?text=Ol%C3%A1%21%20Gostaria%20de%20conhecer%20o%20Igreja%20Inteligente."

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tighter uppercase">
              Igreja<span className="text-blue-600">Inteligente</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Preços</a>
            <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Entrar</Link>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-2.5 text-sm font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
            >
              Falar com Consultor
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-12 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest animate-bounce">
            <Zap className="h-3 w-3 fill-current" /> O Futuro da Gestão Ministerial
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Sua Igreja <span className="text-blue-600">Inteligente</span>,<br/>
            Sua Escala Organizada.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Simplifique a gestão de voluntários, escalas e membros com o sistema mais intuitivo do Brasil. 
            Deixe a tecnologia cuidar da logística enquanto você cuida do ministério.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-emerald-500 hover:-translate-y-1 transition-all duration-500 overflow-hidden inline-block"
            >
              <span className="relative z-10 flex items-center gap-3">
                Agendar Demonstração <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
            <p className="text-sm font-bold text-slate-400">Suporte humanizado. <br/>Instalação imediata.</p>
          </div>
        </div>
      </section>

      {/* Social Proof / Dashboard Preview Mockup */}
      <section className="px-6 pb-24 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="bg-white rounded-[2.5rem] aspect-[16/9] overflow-hidden border border-slate-100 relative group">
              <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-700"></div>
              {/* Representação visual simplificada do dashboard */}
              <div className="p-12 space-y-10">
                <div className="h-10 w-48 bg-slate-100 rounded-full"></div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="h-40 bg-slate-50 rounded-3xl border border-slate-100"></div>
                  <div className="h-40 bg-slate-50 rounded-3xl border border-slate-100"></div>
                  <div className="h-40 bg-slate-50 rounded-3xl border border-slate-100"></div>
                </div>
                <div className="h-64 bg-slate-50 rounded-[3rem] border border-slate-100"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 bg-slate-50/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Tudo que seu ministério precisa.</h2>
            <p className="text-slate-500 font-medium">Ferramentas de elite para quem serve com excelência.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: MessageSquare, 
                title: "WhatsApp Automático", 
                desc: "Notificações automáticas de escala enviadas direto para o celular do voluntário.",
                color: "text-emerald-500",
                bg: "bg-emerald-50"
              },
              { 
                icon: Calendar, 
                title: "Escalas Inteligentes", 
                desc: "Crie eventos e atribua membros com base em suas habilidades específicas.",
                color: "text-blue-500",
                bg: "bg-blue-50"
              },
              { 
                icon: Users, 
                title: "Gestão de Membros", 
                desc: "Cadastro completo com histórico de serviço e talentos ministeriais.",
                color: "text-indigo-500",
                bg: "bg-indigo-50"
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500">
                <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-8 shadow-inner`}>
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Planos e Preços</div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
              O investimento de um lanche <br/>
              <span className="text-slate-400">para transformar sua igreja.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col hover:scale-105 transition-all duration-500">
              <div className="mb-10">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Mensal</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tighter text-slate-400">R$</span>
                  <span className="text-6xl font-black tracking-tighter text-slate-900">79,90</span>
                  <span className="text-sm font-bold text-slate-400">/mês</span>
                </div>
                <p className="mt-4 text-slate-500 font-medium italic">Sem fidelidade, cancele quando quiser.</p>
              </div>

              <div className="space-y-6 flex-1 mb-12">
                {['Membros Ilimitados', 'Escalas Automáticas', 'Suporte WhatsApp', 'Backup Diário'].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                    <span className="font-bold text-slate-700">{text}</span>
                  </div>
                ))}
              </div>

              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-16 rounded-2xl border border-slate-200 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                Falar no WhatsApp
              </a>
            </div>

            {/* Plano Anual - O Mais Vendido */}
            <div className="relative group">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full z-10 shadow-xl shadow-blue-200">
                O Mais Vendido 🔥
              </div>
              <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)] flex flex-col hover:scale-105 transition-all duration-500 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-0"></div>
                
                <div className="mb-10 relative z-10">
                  <p className="text-sm font-black text-blue-400 uppercase tracking-widest mb-2">Fidelidade Anual</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black tracking-tighter text-blue-400/50">R$</span>
                    <span className="text-6xl font-black tracking-tighter text-white">49,90</span>
                    <span className="text-sm font-bold text-blue-400/50">/mês</span>
                  </div>
                  <p className="mt-4 text-blue-200/60 font-medium">Economize 37% por mês no compromisso anual.</p>
                </div>

                <div className="space-y-6 flex-1 mb-12 relative z-10">
                  {['Tudo do Plano Mensal', 'Prioridade no Suporte', 'Consultoria de Onboarding', 'Cobrança Mensal Recorrente'].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                      <span className="font-bold text-blue-50">{text}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center"
                >
                  Quero Contratar
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-6 px-10 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] shadow-sm">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200"></div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500 italic">
                &quot;Teste por 30 dias sem compromisso. Se não amar, não paga nada.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 border-t border-slate-100 bg-slate-50/20 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 font-black text-2xl"><ShieldCheck className="h-8 w-8 text-blue-600" /> SEGURANÇA</div>
           <div className="flex items-center gap-2 font-black text-2xl"><Zap className="h-8 w-8 text-amber-500" /> RAPIDEZ</div>
           <div className="flex items-center gap-2 font-black text-2xl"><Heart className="h-8 w-8 text-red-500" /> APOIO</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-2xl font-black tracking-tighter uppercase">Igreja<span className="text-blue-600">Inteligente</span></h3>
            <p className="text-slate-400 font-medium">Tecnologia a serviço do Reino.</p>
          </div>
          <div className="flex justify-center gap-8 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-slate-900">Termos</a>
            <a href="#" className="hover:text-slate-900">Privacidade</a>
            <a href="#" className="hover:text-slate-900">Suporte</a>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">&copy; 2024 Igreja Inteligente SaaS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
