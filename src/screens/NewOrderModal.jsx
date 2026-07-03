import { useState } from 'react'
import { getSupabase } from '../lib/supabase.js'
import { PRIORITIES } from '../lib/utils.js'

export default function NewOrderModal({ user, users, onClose, onCreated, pushToast }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [local, setLocal] = useState('')
  const [priority, setPriority] = useState('media')
  const [assignedTo, setAssignedTo] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isAdmin = user.role === 'admin'

  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Dê um título para a OS (ex.: "Trocar lâmpada do galpão").')
      return
    }
    setBusy(true)
    setError('')
    const assigned = users.find((u) => u.id === assignedTo)
    const { error: err } = await getSupabase()
      .from('service_orders')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        local: local.trim() || null,
        priority,
        // OS criada pela equipe vai primeiro para aprovação do chefe
        status: isAdmin ? 'aberta' : 'aguardando_aprovacao',
        assigned_to: assigned?.id || null,
        assigned_name: assigned?.name || null,
        created_by: user.id,
        created_name: user.name,
      })
    setBusy(false)
    if (err) {
      setError('Não foi possível salvar. Verifique a internet e tente de novo.')
      return
    }
    pushToast(isAdmin ? '📋 OS criada!' : '⏳ OS enviada para aprovação do Eduardo')
    onCreated()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>＋ Nova Ordem de Serviço</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {!isAdmin && <div className="info-note">Sua OS será enviada para o Eduardo aprovar antes de valer.</div>}
        <form onSubmit={submit}>
          <label>
            O que precisa ser feito? *
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Consertar portão da entrada" />
          </label>
          <label>
            Detalhes
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explique melhor o serviço (opcional)"
            />
          </label>
          <label>
            Onde? (local do serviço)
            <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex.: Galpão 2, Escritório…" />
          </label>
          <label>
            Prioridade
            <div className="prio-picker">
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button
                  type="button"
                  key={key}
                  className={priority === key ? 'prio-btn active' : 'prio-btn'}
                  style={priority === key ? { background: p.color, borderColor: p.color, color: '#fff' } : { color: p.color }}
                  onClick={() => setPriority(key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </label>
          <label>
            Responsável
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">— Escolher depois —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Salvando…' : isAdmin ? 'Criar OS' : 'Enviar para aprovação'}
          </button>
        </form>
      </div>
    </div>
  )
}
