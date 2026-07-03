import { useState } from 'react'
import { saveConfig } from '../lib/supabase.js'

// Tela que aparece só na primeira vez, quando o app ainda não
// sabe qual é o banco de dados (Supabase) da equipe.
export default function Setup({ onDone }) {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!url.trim().startsWith('https://') || !url.includes('supabase.co')) {
      setError('O endereço deve ser parecido com: https://xxxxx.supabase.co')
      return
    }
    if (key.trim().length < 20) {
      setError('Cole a chave "anon public" completa do Supabase.')
      return
    }
    saveConfig(url, key)
    onDone()
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛠️</div>
        <h1>Gestor de OS</h1>
        <p className="auth-sub">Configuração inicial (só na primeira vez)</p>
        <form onSubmit={submit}>
          <label>
            Endereço do Supabase
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
              autoCapitalize="none"
            />
          </label>
          <label>
            Chave (anon public)
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOi..."
              autoCapitalize="none"
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" type="submit">
            Salvar e continuar
          </button>
        </form>
        <p className="auth-hint">
          Essas informações estão no site do Supabase, em <b>Settings → API</b>. Quem publicou o app na Vercel pode
          preencher isso automaticamente pelas variáveis de ambiente.
        </p>
      </div>
    </div>
  )
}
