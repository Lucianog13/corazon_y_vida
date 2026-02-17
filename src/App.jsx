import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import MedicationList from './components/MedicationList'
import HealthMonitor from './components/HealthMonitor'
import BottomNav from './components/BottomNav'

import Settings from './components/Settings'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-2xl font-bold animate-pulse text-white uppercase italic">Corazón y Vida</div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 pb-24">
        <Routes>
          <Route path="/" element={<Dashboard userEmail={session.user.email} />} />
          <Route path="/medicinas" element={<MedicationList />} />
          <Route path="/progreso" element={<HealthMonitor />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  )
}

export default App
