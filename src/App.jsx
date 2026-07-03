import { useCallback, useEffect, useRef, useState } from 'react'
import { getConfig, getSupabase } from './lib/supabase.js'
import { askNotificationPermission, browserNotify, buildNotification } from './lib/notify.js'
import Setup from './screens/Setup.jsx'
import Login from './screens/Login.jsx'
import OrdersScreen from './screens/OrdersScreen.jsx'
import HistoryScreen from './screens/HistoryScreen.jsx'
import TeamScreen from './screens/TeamScreen.jsx'
import NewOrderModal from './screens/NewOrderModal.jsx'
import OrderDetail from './screens/OrderDetail.jsx'

export default function App() {
  const [configured, setConfigured] = useState(() => !!getConfig())
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('os-app-user') || 'null')
    } catch {
      return null
    }
  })
  const [tab, setTab] = useState('ordens')
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toasts, setToasts] = useState([])
  const userRef = useRef(user)
  userRef.current = user

  const pushToast = useCallback((title, body) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, title, body }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000)
  }, [])

  const fetchAll = useCallback(async () => {
    const sb = getSupabase()
    if (!sb) return
    try {
      const [o, u] = await Promise.all([
        sb.from('service_orders').select('*').order('created_at', { ascending: false }),
        sb.from('app_users').select('id, name, username, role, created_at').order('name'),
      ])
      if (!o.error) setOrders(o.data || [])
      if (!u.error) setUsers(u.data || [])
    } catch {
      // sem internet: mantém o que já estava na tela
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!configured || !user) return
    fetchAll()
    askNotificationPermission()
    const sb = getSupabase()
    const channel = sb
      .channel('os-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, (payload) => {
        fetchAll()
        const n = buildNotification(payload, userRef.current)
        if (n) {
          pushToast(n.title, n.body)
          browserNotify(n.title, n.body)
        }
      })
      .subscribe()
    return () => sb.removeChannel(channel)
  }, [configured, user, fetchAll, pushToast])

  function login(u) {
    localStorage.setItem('os-app-user', JSON.stringify(u))
    setUser(u)
    setLoading(true)
  }

  function logout() {
    localStorage.removeItem('os-app-user')
    setUser(null)
    setTab('ordens')
  }

  if (!configured) return <Setup onDone={() => setConfigured(true)} />
  if (!user) return <Login onLogin={login} />

  const isAdmin = user.role === 'admin'
  const active = orders.filter((o) => !['concluida', 'recusada'].includes(o.status))
  const history = orders.filter((o) => ['concluida', 'recusada'].includes(o.status))
  const selectedOrder = selected ? orders.find((o) => o.id === selected) : null

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-logo">🛠️</span>
            <div>
              <h1>Gestor de OS</h1>
              <p>
                Olá, <b>{user.name}</b> {isAdmin && <span className="chief-badge">👑 Chefe</span>}
              </p>
            </div>
          </div>
          <button className="btn-ghost" onClick={logout} title="Sair">
            Sair ⎋
          </button>
        </div>
      </header>

      <main className="content">
        {tab === 'ordens' && (
          <OrdersScreen orders={active} user={user} loading={loading} onSelect={(o) => setSelected(o.id)} />
        )}
        {tab === 'historico' && <HistoryScreen orders={history} onSelect={(o) => setSelected(o.id)} />}
        {tab === 'equipe' && isAdmin && <TeamScreen users={users} onChanged={fetchAll} pushToast={pushToast} />}
      </main>

      <button className="fab" onClick={() => setShowNew(true)} aria-label="Nova OS">
        ＋
      </button>

      <nav className="tabbar">
        <button className={tab === 'ordens' ? 'tab active' : 'tab'} onClick={() => setTab('ordens')}>
          <span className="tab-icon">📋</span>
          Ordens
          {active.length > 0 && <span className="tab-count">{active.length}</span>}
        </button>
        <button className={tab === 'historico' ? 'tab active' : 'tab'} onClick={() => setTab('historico')}>
          <span className="tab-icon">📚</span>
          Histórico
        </button>
        {isAdmin && (
          <button className={tab === 'equipe' ? 'tab active' : 'tab'} onClick={() => setTab('equipe')}>
            <span className="tab-icon">👥</span>
            Equipe
          </button>
        )}
      </nav>

      {showNew && (
        <NewOrderModal
          user={user}
          users={users}
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false)
            fetchAll()
          }}
          pushToast={pushToast}
        />
      )}

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          user={user}
          users={users}
          onClose={() => setSelected(null)}
          onChanged={fetchAll}
          pushToast={pushToast}
        />
      )}

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <b>{t.title}</b>
            {t.body && <span>{t.body}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
