import { useState } from 'react'
import { getSupabase } from '../lib/supabase.js'
import { PRIORITIES, STATUS, fmtDateTime, fmtDate, dateInputToISO, todayInputValue } from '../lib/utils.js'

export default function OrderDetail({ order, user, users, onClose, onChanged, pushToast }) {
  const [busy, setBusy] = useState(false)
  const [panel, setPanel] = useState(null) // 'feita' | 'concluir'
  const [doneDate, setDoneDate] = useState(todayInputValue())
  const [doneLocal, setDoneLocal] = useState(order.local || '')
  const [doneNote, setDoneNote] = useState('')

  const isAdmin = user.role === 'admin'
  const isMine = order.assigned_to === user.id
  const p = PRIORITIES[order.priority]
  const s = STATUS[order.status]
  const finished = ['concluida', 'recusada'].includes(order.status)

  async function update(patch, toast) {
    setBusy(true)
    const { error } = await getSupabase().from('service_orders').update(patch).eq('id', order.id)
    setBusy(false)
    if (error) {
      pushToast('⚠️ Erro ao salvar', 'Verifique a internet e tente de novo.')
      return
    }
    if (toast) pushToast(toast)
    onChanged()
    onClose()
  }

  // Equipe marca que fez o serviço → vai para análise do chefe
  function markDone() {
    update(
      {
        status: 'em_analise',
        done_at: dateInputToISO(doneDate),
        done_local: doneLocal.trim() || order.local,
        done_note: doneNote.trim() || null,
      },
      '🔎 Enviado para análise do Eduardo'
    )
  }

  // Chefe conclui (com data retroativa se quiser)
  function concludeNow() {
    update(
      {
        status: 'concluida',
        done_at: order.done_at || dateInputToISO(doneDate),
        done_local: order.done_local || doneLocal.trim() || order.local,
        closed_at: new Date().toISOString(),
        closed_by_name: user.name,
      },
      '✅ OS concluída!'
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>OS #{order.numero}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="detail-badges">
          <span className="badge" style={{ color: p.color, background: p.bg }}>
            Prioridade {p.label}
          </span>
          <span className="badge" style={{ color: s.color, background: s.bg }}>
            {s.icon} {s.label}
          </span>
        </div>

        <h3 className="detail-title">{order.title}</h3>
        {order.description && <p className="detail-desc">{order.description}</p>}

        <div className="detail-grid">
          <div>
            <small>📍 Local do serviço</small>
            <span>{order.local || '—'}</span>
          </div>
          <div>
            <small>👤 Responsável</small>
            <span>{order.assigned_name || 'Sem responsável'}</span>
          </div>
          <div>
            <small>✍️ Criada por</small>
            <span>
              {order.created_name} em {fmtDateTime(order.created_at)}
            </span>
          </div>
          {order.done_at && (
            <div>
              <small>🔨 Serviço feito</small>
              <span>
                {fmtDate(order.done_at)}
                {order.done_local ? ` — em ${order.done_local}` : ''}
              </span>
            </div>
          )}
          {order.done_note && (
            <div>
              <small>💬 Observação de quem fez</small>
              <span>{order.done_note}</span>
            </div>
          )}
          {order.closed_at && order.status === 'concluida' && (
            <div>
              <small>✅ Concluída por</small>
              <span>
                {order.closed_by_name} em {fmtDateTime(order.closed_at)}
              </span>
            </div>
          )}
        </div>

        {/* ---------- Ações ---------- */}
        {!finished && (
          <div className="actions">
            {/* Chefe aprova ou recusa OS criada pela equipe */}
            {isAdmin && order.status === 'aguardando_aprovacao' && (
              <>
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={() => update({ status: 'aberta' }, '✔️ OS aprovada!')}
                >
                  ✔️ Aprovar — virar OS de verdade
                </button>
                <button
                  className="btn-danger"
                  disabled={busy}
                  onClick={() =>
                    update({ status: 'recusada', closed_at: new Date().toISOString(), closed_by_name: user.name }, '🚫 OS recusada')
                  }
                >
                  🚫 Recusar
                </button>
              </>
            )}

            {/* Chefe muda o responsável */}
            {isAdmin && ['aberta', 'aguardando_aprovacao'].includes(order.status) && (
              <label className="inline-field">
                Mudar responsável
                <select
                  disabled={busy}
                  value={order.assigned_to || ''}
                  onChange={(e) => {
                    const u = users.find((x) => x.id === e.target.value)
                    update({ assigned_to: u?.id || null, assigned_name: u?.name || null }, u ? `👤 Atribuída a ${u.name}` : undefined)
                  }}
                >
                  <option value="">Sem responsável</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Responsável marca que fez */}
            {order.status === 'aberta' && isMine && !isAdmin && panel !== 'feita' && (
              <button className="btn-primary" onClick={() => setPanel('feita')}>
                ✅ Já fiz esse serviço
              </button>
            )}

            {panel === 'feita' && (
              <div className="sub-panel">
                <label>
                  Quando você fez?
                  <input type="date" value={doneDate} onChange={(e) => setDoneDate(e.target.value)} max={todayInputValue()} />
                </label>
                <label>
                  Onde foi feito?
                  <input value={doneLocal} onChange={(e) => setDoneLocal(e.target.value)} placeholder="Local do serviço" />
                </label>
                <label>
                  Observação (opcional)
                  <textarea value={doneNote} onChange={(e) => setDoneNote(e.target.value)} rows={2} placeholder="Ex.: troquei a peça X" />
                </label>
                <button className="btn-primary" disabled={busy} onClick={markDone}>
                  🔎 Enviar para análise do Eduardo
                </button>
              </div>
            )}

            {/* Chefe analisa serviço marcado como feito */}
            {isAdmin && order.status === 'em_analise' && (
              <>
                <button className="btn-success" disabled={busy} onClick={concludeNow}>
                  ✅ Confirmei — concluir OS
                </button>
                <button
                  className="btn-ghost-danger"
                  disabled={busy}
                  onClick={() => update({ status: 'aberta', done_at: null, done_local: null, done_note: null }, '↩️ OS voltou para aberta')}
                >
                  ↩️ Não foi feito — voltar para aberta
                </button>
              </>
            )}

            {/* Chefe conclui direto, com data retroativa se quiser */}
            {isAdmin && order.status === 'aberta' && panel !== 'concluir' && (
              <button className="btn-success" onClick={() => setPanel('concluir')}>
                ✅ Concluir esta OS
              </button>
            )}
            {panel === 'concluir' && (
              <div className="sub-panel">
                <label>
                  Data em que o serviço foi feito (pode ser retroativa)
                  <input type="date" value={doneDate} onChange={(e) => setDoneDate(e.target.value)} max={todayInputValue()} />
                </label>
                <label>
                  Onde foi feito?
                  <input value={doneLocal} onChange={(e) => setDoneLocal(e.target.value)} placeholder="Local do serviço" />
                </label>
                <button className="btn-success" disabled={busy} onClick={concludeNow}>
                  ✅ Concluir OS
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
