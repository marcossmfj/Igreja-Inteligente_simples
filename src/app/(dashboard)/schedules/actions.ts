'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addSchedule(formData: FormData) {
  try {
    const date = formData.get('date') as string
    const event_name = formData.get('event_name') as string
    const skill_id = formData.get('skill_id') as string
    const member_id = formData.get('member_id') as string

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Usuário não autenticado.' }
    }

    // Usar Admin para evitar o erro 500 de recursividade do RLS na tabela profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.church_id) {
      return { error: 'Seu usuário não está vinculado a nenhuma igreja. Verifique o Painel Master.' }
    }

    // Validar se o membro já está escalado para este evento na mesma data
    const { data: existingSchedule } = await supabase
      .from('schedules')
      .select('id')
      .eq('date', date)
      .eq('event_name', event_name || 'Culto')
      .eq('member_id', member_id)
      .eq('church_id', profile.church_id)
      .maybeSingle()

    if (existingSchedule) {
      return { error: 'Este membro já está escalado para este evento nesta data.' }
    }

    const { error } = await supabase.from('schedules').insert({ 
      date, 
      event_name: event_name || 'Culto',
      skill_id: skill_id || null, 
      member_id, 
      church_id: profile.church_id 
    })
    
    if (error) {
      return { error: 'Erro ao inserir escala: ' + (error?.message || 'Erro desconhecido') }
    }

    revalidatePath('/schedules')
    return { success: true }
  } catch (err: any) {
    return { error: 'Erro inesperado: ' + (err?.message || 'Erro desconhecido') }
  }
}

export async function updateSchedule(id: string, formData: FormData) {
  try {
    const date = formData.get('date') as string
    const event_name = formData.get('event_name') as string
    const skill_id = formData.get('skill_id') as string
    const member_id = formData.get('member_id') as string

    const supabase = await createClient()
    const { error } = await supabase
      .from('schedules')
      .update({
        date,
        event_name: event_name || 'Culto',
        skill_id: skill_id || null,
        member_id
      })
      .eq('id', id)

    if (error) return { error: 'Erro ao atualizar: ' + error.message }
    
    revalidatePath('/schedules')
    return { success: true }
  } catch (err: any) {
    return { error: 'Erro inesperado: ' + err.message }
  }
}

export async function deleteSchedule(id: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) {
      console.error('Erro ao deletar escala:', error.message)
      return
    }
    revalidatePath('/schedules')
  } catch (err: any) {
    console.error('Erro inesperado ao deletar escala:', err?.message || 'Erro desconhecido')
  }
}

export async function markAsNotified(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('schedules')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/schedules')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateScheduleStatus(id: string, status: 'pending' | 'confirmed' | 'declined') {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('schedules')
      .update({ status })
      .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/schedules')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function generateWhatsAppLink(id: string) {
  try {
    const supabase = await createClient()
    const { data: schedule, error } = await supabase
      .from('schedules')
      .select('date, event_name, members(name, phone), skills(name)')
      .eq('id', id)
      .single()

    if (error || !schedule) {
      return { error: 'Escala não encontrada.' }
    }

    const member = schedule.members as any
    const skill = schedule.skills as any

    if (!member?.phone) {
      return { error: `Não é possível notificar. O membro ${member?.name || ''} não possui um telefone cadastrado.` }
    }

    const phone = member.phone.replace(/\D/g, '')
    if (phone.length < 10) {
      return { error: 'O número de telefone cadastrado é inválido.' }
    }

    // A data salva no banco já é YYYY-MM-DD
    const [year, month, day] = schedule.date.split('-')
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

    const msg = `Paz do Senhor, *${member.name}*! ✨\nPassando para confirmar a sua escala como *${skill?.name || 'Auxiliar'}* no nosso encontro do dia *${formattedDate}*.\nPodemos contar com você? Responda esta mensagem para confirmar sua presença! 🙏`
    
    // Assumindo DDI 55 para números brasileiros caso não venha formatado
    const ddiPhone = phone.startsWith('55') ? phone : `55${phone}`
    const link = `https://api.whatsapp.com/send?phone=${ddiPhone}&text=${encodeURIComponent(msg)}`

    return { success: true, link }
  } catch (err: any) {
    return { error: 'Erro inesperado ao gerar link: ' + err.message }
  }
}
