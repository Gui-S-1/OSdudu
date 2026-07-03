export async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const PRIORITIES = {
  urgente: { label: 'Urgente', color: '#dc2626', bg: '#fee2e2', order: 0 },
  alta: { label: 'Alta', color: '#ea580c', bg: '#ffedd5', order: 1 },
  media: { label: 'Média', color: '#ca8a04', bg: '#fef9c3', order: 2 },
  baixa: { label: 'Baixa', color: '#16a34a', bg: '#dcfce7', order: 3 },
}

export const STATUS = {
  aguardando_aprovacao: { label: 'Aguardando aprovação', color: '#9333ea', bg: '#f3e8ff', icon: '⏳' },
  aberta: { label: 'Aberta', color: '#2563eb', bg: '#dbeafe', icon: '🔧' },
  em_analise: { label: 'Em análise', color: '#d97706', bg: '#fef3c7', icon: '🔎' },
  concluida: { label: 'Concluída', color: '#16a34a', bg: '#dcfce7', icon: '✅' },
  recusada: { label: 'Recusada', color: '#64748b', bg: '#f1f5f9', icon: '🚫' },
}

export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' às ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  )
}

// Converte data de um <input type="date"> (aaaa-mm-dd) para ISO ao meio-dia local
export function dateInputToISO(value) {
  if (!value) return new Date().toISOString()
  return new Date(value + 'T12:00:00').toISOString()
}

export function todayInputValue() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
