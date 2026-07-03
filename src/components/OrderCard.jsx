import { PRIORITIES, STATUS, fmtDate } from '../lib/utils.js'

export default function OrderCard({ order, user, onClick }) {
  const p = PRIORITIES[order.priority]
  const s = STATUS[order.status]
  const mine = user && order.assigned_to === user.id && !['concluida', 'recusada'].includes(order.status)
  const done = order.status === 'concluida'

  return (
    <button className={'os-card' + (done ? ' done' : '')} style={{ borderLeftColor: p.color }} onClick={onClick}>
      <div className="os-card-top">
        <span className="os-num">OS #{order.numero}</span>
        <span className="badge" style={{ color: p.color, background: p.bg }}>
          {p.label}
        </span>
        <span className="badge" style={{ color: s.color, background: s.bg }}>
          {s.icon} {s.label}
        </span>
      </div>
      <h3>{order.title}</h3>
      <div className="os-card-meta">
        {order.local && <span>📍 {order.local}</span>}
        <span>👤 {order.assigned_name || 'Sem responsável'}</span>
        {done ? <span>✅ Feita em {fmtDate(order.done_at || order.closed_at)}</span> : <span>🗓️ {fmtDate(order.created_at)}</span>}
      </div>
      {mine && <div className="mine-flag">Atribuída a você</div>}
    </button>
  )
}
