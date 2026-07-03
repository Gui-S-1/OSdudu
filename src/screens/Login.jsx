import { useState } from 'react'
import { getSupabase } from '../lib/supabase.js'
import { sha256 } from '../lib/utils.js'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const sb = getSupabase()
      const { data, error: err } = await sb
        .from('app_users')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .maybeSingle()
      if (err) throw err
      const hash = await sha256(password)
      if (!data || data.password_hash !== hash) {
        setError('Usuário ou senha incorretos. Tente novamente.')
        return
      }
      onLogin({ id: data.id, name: data.name, username: data.username, role: data.role })
    } catch {
      setError('Não foi possível conectar. Verifique a internet.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛠️</div>
        <h1>Gestor de OS</h1>
        <p className="auth-sub">Entre com seu usuário e senha</p>
        <form onSubmit={submit}>
          <label>
            Usuário
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu usuário"
              autoCapitalize="none"
              autoComplete="username"
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="sua senha"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
