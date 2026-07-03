import OrderCard from '../components/OrderCard.jsx'
import { fmtDate } from '../lib/utils.js'

export default function HistoryScreen({ orders, onSelect }) {
  const done = orders.filter((o) => o.status === 'concluida')
  const refused = orders.filter((o) => o.status === 'recusada')

  return (
    <div>
      {orders.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          O histórico ainda está vazio.
          <small>As OS concluídas aparecem aqui, verdinhas. 💚</small>
        </div>
      )}

      {done.length > 0 && (
        <section className="os-section">
          <h2>
            ✅ Concluídas <span className="section-count green">{done.length}</span>
          </h2>
          {done.map((o) => (
            <OrderCard key={o.id} order={o} onClick={() => onSelect(o)} />
          ))}
        </section>
      )}

      {refused.length > 0 && (
        <section className="os-section">
          <h2>
            🚫 Recusadas <span className="section-count">{refused.length}</span>
          </h2>
          {refused.map((o) => (
            <OrderCard key={o.id} order={o} onClick={() => onSelect(o)} />
          ))}
        </section>
      )}
    </div>
  )
}
