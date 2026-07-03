import { useState } from 'react'
import OrderCard from '../components/OrderCard.jsx'
import { PRIORITIES } from '../lib/utils.js'

const SECTIONS = [
  { key: 'aguardando_aprovacao', title: '⏳ Aguardando aprovação do Eduardo' },
  { key: 'em_analise', title: '🔎 Feitas — em análise do Eduardo' },
  { key: 'aberta', title: '🔧 Abertas' },
]

export default function OrdersScreen({ orders, user, loading, onSelect }) {
  const [prio, setPrio] = useState('todas')
  const [onlyMine, setOnlyMine] = useState(false)

  let list = orders
  if (prio !== 'todas') list = list.filter((o) => o.priority === prio)
  if (onlyMine) list = list.filter((o) => o.assigned_to === user.id)

  const byPriority = (a, b) => PRIORITIES[a.priority].order - PRIORITIES[b.priority].order

  if (loading) {
    return <div className="empty-state">Carregando ordens…</div>
  }

  return (
    <div>
      <div className="filters">
        <div className="filter-chips">
          <button className={prio === 'todas' ? 'chip active' : 'chip'} onClick={() => setPrio('todas')}>
            Todas
          </button>
          {Object.entries(PRIORITIES).map(([key, p]) => (
            <button
              key={key}
              className={prio === key ? 'chip active' : 'chip'}
              style={prio === key ? { background: p.color, borderColor: p.color } : {}}
              onClick={() => setPrio(key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="mine-toggle">
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
          Só as minhas
        </label>
      </div>

      {list.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🎉</span>
          Nenhuma ordem de serviço por aqui.
          <small>Toque no botão ＋ para criar uma nova.</small>
        </div>
      )}

      {SECTIONS.map((sec) => {
        const items = list.filter((o) => o.status === sec.key).sort(byPriority)
        if (items.length === 0) return null
        return (
          <section key={sec.key} className="os-section">
            <h2>
              {sec.title} <span className="section-count">{items.length}</span>
            </h2>
            {items.map((o) => (
              <OrderCard key={o.id} order={o} user={user} onClick={() => onSelect(o)} />
            ))}
          </section>
        )
      })}
    </div>
  )
}
