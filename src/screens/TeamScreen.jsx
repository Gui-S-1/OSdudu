import { useState } from 'react'
import { getSupabase } from '../lib/supabase.js'
import { sha256 } from '../lib/utils.js'

// Tela do chefe: criar logins novos para a equipe
export default function TeamScreen({ users, onChanged, pushToast }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('worker')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !username.trim() || password.length < 4) {
      setError('Preencha nome, usuário e uma senha com pelo menos 4 letras/números.')
      return
    }
    setBusy(true)
    const { error: err } = await getSupabase()
      .from('app_users')
      .insert({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password_hash: await sha256(password),
        role,
      })
    setBusy(false)
    if (err) {
      setError(err.code === '23505' ? 'Já existe alguém com esse usuário. Escolha outro.' : 'Erro ao salvar. Tente de novo.')
      return
    }
    pushToast(`👤 Login criado para ${name.trim()}!`)
    setName('')
    setUsername('')
    setPassword('')
    setRole('worker')
    onChanged()
  }

  return (
    <div>
      <section className="os-section">
        <h2>👥 Equipe</h2>
        {users.map((u) => (
          <div key={u.id} className="user-card">
            <div className="user-avatar">{u.name.slice(0, 1).toUpperCase()}</div>
            <div>
              <b>{u.name}</b>
              <small>
                @{u.username} · {u.role === 'admin' ? '👑 Chefe' : 'Equipe'}
              </small>
            </div>
          </div>
        ))}
      </section>

      <section className="os-section">
        <h2>＋ Criar novo login</h2>
        <form className="team-form" onSubmit={submit}>
          <label>
            Nome da pessoa
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: João" />
          </label>
          <label>
            Usuário (para entrar no app)
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex.: joao" autoCapitalize="none" />
          </label>
          <label>
            Senha
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 4 caracteres" />
          </label>
          <label>
            Tipo
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="worker">Equipe (faz os serviços)</option>
              <option value="admin">Chefe (aprova e conclui)</option>
            </select>
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Criando…' : 'Criar login'}
          </button>
        </form>
      </section>
    </div>
  )
}
