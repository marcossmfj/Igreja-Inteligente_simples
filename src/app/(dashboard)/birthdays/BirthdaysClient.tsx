'use client'

import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { Download, Upload, Image as ImageIcon, Search, Calendar } from 'lucide-react'

type BirthdayMember = {
  id: string
  name: string
  birth_date: string
  role?: { name: string } | null
  isMonth: boolean
  isWeek: boolean
  isToday: boolean
  birthdayThisYear: Date
}

interface BirthdaysClientProps {
  initialData: BirthdayMember[]
}

export default function BirthdaysClient({ initialData }: BirthdaysClientProps) {
  const [filter, setFilter] = useState<'month' | 'week'>('month')
  const [title, setTitle] = useState('Aniversariantes do Mês')
  const [verse, setVerse] = useState('"O Senhor te abençoe e te guarde..." - Números 6:24')
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const slideRef = useRef<HTMLDivElement>(null)

  const filteredMembers = initialData.filter(m => filter === 'month' ? m.isMonth : m.isWeek)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setBgImage(url)
    }
  }

  const handleDownload = async () => {
    if (!slideRef.current) return
    
    try {
      setIsGenerating(true)
      const dataUrl = await toPng(slideRef.current, { 
        quality: 1.0,
        pixelRatio: 2 // High resolution
      })
      
      const link = document.createElement('a')
      link.download = `aniversariantes-${filter}-${new Date().getTime()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Erro ao gerar imagem:', err)
      alert('Erro ao gerar a imagem do slide. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Coluna da Esquerda: Configurações e Lista */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Controles do Gerador */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Configurar Slide</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Filtro de Aniversariantes</label>
              <div className="flex bg-gray-900/50 p-1 rounded-lg">
                <button
                  onClick={() => { setFilter('month'); setTitle('Aniversariantes do Mês') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Deste Mês
                </button>
                <button
                  onClick={() => { setFilter('week'); setTitle('Aniversariantes da Semana') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Desta Semana
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Título do Slide</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Mensagem ou Versículo</label>
              <textarea
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                rows={2}
                className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Fundo Personalizado (Opcional)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-gray-900/50 border border-dashed border-white/20 hover:border-blue-500/50 rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors">
                  <Upload className="w-4 h-4" />
                  Fazer Upload de Arte
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {bgImage && (
                  <button onClick={() => setBgImage(null)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors" title="Remover Fundo">
                    Remover
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Dica: Use uma imagem quadrada (ex: 1080x1080) com a logo da sua igreja.</p>
            </div>
            
            <button
              onClick={handleDownload}
              disabled={isGenerating || filteredMembers.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-500/20"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isGenerating ? 'Gerando Imagem...' : 'Baixar Imagem'}
            </button>
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Lista ({filteredMembers.length})
            </h3>
          </div>
          <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {filteredMembers.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Nenhum aniversariante encontrado neste período.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMembers.map(member => {
                  const birthDate = new Date(member.birthdayThisYear)
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          {member.name}
                          {member.isToday && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Hoje</span>}
                        </p>
                        {member.role?.name && <p className="text-xs text-gray-400">{member.role.name}</p>}
                      </div>
                      <div className="text-sm text-gray-400 font-medium bg-gray-900/50 px-3 py-1 rounded-md">
                        {birthDate.getDate().toString().padStart(2, '0')}/{(birthDate.getMonth() + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coluna da Direita: Preview do Slide */}
      <div className="lg:col-span-7 flex flex-col items-center justify-start">
        <h2 className="text-sm font-medium text-gray-400 mb-4 self-start">Pré-visualização do Slide</h2>
        
        {/* Container que será capturado - Aspect Ratio 1:1 (Quadrado) */}
        <div 
          ref={slideRef}
          className="relative w-full aspect-square max-w-[600px] rounded-xl overflow-hidden shadow-2xl flex flex-col bg-gray-900"
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Fallback de fundo animado se não houver imagem */}
          {!bgImage && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 opacity-80" />
          )}

          {/* Overlay escuro para garantir leitura do texto, especialmente se a imagem de fundo for clara */}
          {bgImage && <div className="absolute inset-0 bg-black/40" />}

          {/* Conteúdo do Slide */}
          <div className="relative z-10 flex flex-col h-full p-8 md:p-12">
            
            {/* Header / Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {title}
              </h1>
              <div className="w-24 h-1.5 bg-blue-500 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            </div>

            {/* Lista de Aniversariantes no Slide */}
            <div className="flex-1 overflow-hidden flex flex-col justify-center">
              {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center justify-items-center">
                  {filteredMembers.slice(0, 16).map((member, i) => { // Limitando para caber no slide (aprox 16)
                    const birthDate = new Date(member.birthdayThisYear)
                    return (
                      <div key={i} className="flex items-center gap-3 w-full max-w-[250px]">
                        <span className="text-blue-400 font-bold text-lg md:text-xl w-12 text-right" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          {birthDate.getDate().toString().padStart(2, '0')}
                        </span>
                        <div className="w-1 h-6 bg-white/20 rounded-full" />
                        <span className="text-white font-medium text-lg md:text-xl truncate" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          {member.name.split(' ').slice(0, 2).join(' ')}
                          {member.role?.name && (
                            <span className="text-blue-300 text-sm md:text-base ml-2 font-normal">({member.role.name})</span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center text-white/50 text-xl font-medium">
                  Adicione aniversariantes para visualizar aqui.
                </div>
              )}
              {filteredMembers.length > 16 && (
                <p className="text-center text-white/60 mt-4 text-sm font-medium">
                  + {filteredMembers.length - 16} aniversariantes
                </p>
              )}
            </div>

            {/* Footer / Verse */}
            <div className="mt-8 text-center px-4">
              <p className="text-white/90 text-lg md:text-xl font-medium italic" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {verse}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
