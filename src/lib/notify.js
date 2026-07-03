// Notificações do navegador (aparecem no celular quando o app está instalado)
export function askNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function browserNotify(title, body) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png' })
      )
    } else {
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  } catch {}
}

// Decide quem recebe qual aviso quando uma OS muda no banco
export function buildNotification(payload, user) {
  const os = payload.new
  if (!os) return null
  const num = `OS #${os.numero}`
  const isAdmin = user.role === 'admin'
  const isMine = os.assigned_to === user.id

  if (payload.eventType === 'INSERT') {
    if (os.status === 'aguardando_aprovacao') {
      if (isAdmin) return { title: `⏳ ${num} aguardando sua aprovação`, body: `${os.created_name} criou: ${os.title}` }
      if (os.created_by === user.id) return null
      return { title: `📋 Nova OS enviada para aprovação`, body: `${os.created_name} criou: ${os.title}` }
    }
    if (os.status === 'aberta') {
      if (isMine) return { title: `🔧 ${num} atribuída a VOCÊ`, body: `${os.title} • Prioridade ${os.priority}` }
      return { title: `📋 Nova ${num} criada`, body: `${os.title}${os.assigned_name ? ' • Responsável: ' + os.assigned_name : ''}` }
    }
  }

  if (payload.eventType === 'UPDATE') {
    const before = payload.old || {}
    if (before.status === os.status && before.assigned_to === os.assigned_to) return null
    if (os.status === 'em_analise') {
      if (isAdmin) return { title: `🔎 ${num} entrou em análise`, body: `${os.assigned_name || 'Alguém'} marcou como feita: ${os.title}` }
      return null // essa notificação é só do chefe
    }
    if (os.status === 'aberta' && before.status === 'aguardando_aprovacao') {
      if (isMine) return { title: `🔧 ${num} aprovada e atribuída a VOCÊ`, body: os.title }
      return { title: `✔️ ${num} foi aprovada pelo Eduardo`, body: os.title }
    }
    if (os.status === 'aberta' && before.status === 'em_analise') {
      if (isMine) return { title: `↩️ ${num} voltou para você`, body: `O Eduardo pediu para revisar: ${os.title}` }
      return null
    }
    if (os.status === 'concluida') {
      return { title: `✅ ${num} concluída!`, body: os.title }
    }
    if (os.status === 'recusada') {
      if (os.created_by === user.id) return { title: `🚫 Sua ${num} foi recusada`, body: os.title }
      return null
    }
    if (before.assigned_to !== os.assigned_to && isMine) {
      return { title: `🔧 ${num} atribuída a VOCÊ`, body: os.title }
    }
  }
  return null
}
