import { createClient } from '@supabase/supabase-js'

// A configuração pode vir das variáveis de ambiente (Vercel)
// ou ficar salva no aparelho (tela de configuração do app).
const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function getConfig() {
  if (envUrl && envKey) return { url: envUrl, key: envKey }
  try {
    const saved = JSON.parse(localStorage.getItem('os-app-config') || 'null')
    if (saved?.url && saved?.key) return saved
  } catch {}
  return null
}

export function saveConfig(url, key) {
  localStorage.setItem('os-app-config', JSON.stringify({ url: url.trim(), key: key.trim() }))
}

let client = null
export function getSupabase() {
  if (client) return client
  const cfg = getConfig()
  if (!cfg) return null
  client = createClient(cfg.url, cfg.key)
  return client
}
