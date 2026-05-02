'use server'

import { createClient } from '@/utils/supabase/server'
import { isSameMonth, parseISO, isSameWeek } from 'date-fns'

export type BirthdayMember = {
  id: string
  name: string
  birth_date: string
  role?: { name: string } | null
}

export async function getBirthdays() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Não autenticado' }

    const { data: profile } = await supabase.from('profiles').select('church_id').eq('id', user.id).single()
    if (!profile?.church_id) return { error: 'Igreja não encontrada' }

    // Buscar membros ativos que possuem data de nascimento
    const { data: members, error } = await supabase
      .from('members')
      .select(`
        id,
        name,
        birth_date,
        roles(name)
      `)
      .eq('church_id', profile.church_id)
      .eq('status', 'Ativo')
      .not('birth_date', 'is', null)

    if (error) {
      console.error('Erro ao buscar membros para aniversariantes:', error)
      return { error: 'Erro ao buscar aniversariantes: ' + error.message }
    }

    if (!members) return { data: [] }

    const today = new Date()

    // O birth_date vem como string "YYYY-MM-DD"
    // Vamos mapear e adicionar flags de "aniversariante do mês" e "aniversariante da semana"
    const parsedMembers = members.map(m => {
      const birthDate = parseISO(m.birth_date as string)
      // Para comparar se é o mesmo mês/semana, temos que ignorar o ano de nascimento
      // e focar apenas no mês e dia do aniversário no ano atual.
      const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      
      const isMonth = isSameMonth(birthdayThisYear, today)
      const isWeek = isSameWeek(birthdayThisYear, today, { weekStartsOn: 0 }) // Domingo como início
      const isToday = birthdayThisYear.getDate() === today.getDate() && birthdayThisYear.getMonth() === today.getMonth()

      return {
        id: m.id,
        name: m.name,
        birth_date: m.birth_date as string,
        role: Array.isArray(m.roles) ? m.roles[0] : m.roles,
        isMonth,
        isWeek,
        isToday,
        birthdayThisYear
      }
    })

    // Ordenar pelo dia do mês (do menor para o maior)
    parsedMembers.sort((a, b) => a.birthdayThisYear.getTime() - b.birthdayThisYear.getTime())

    return { data: parsedMembers }

  } catch (err: any) {
    console.error('Erro inesperado em getBirthdays:', err)
    return { error: 'Erro inesperado' }
  }
}
