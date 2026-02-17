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

    // Request Notification Permissions
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission)
      })
    }

    // Background Reminder Check
    const reminderInterval = setInterval(checkReminders, 60000)

    return () => {
      subscription.unsubscribe()
      clearInterval(reminderInterval)
    }
  }, [])

  const checkReminders = async () => {
    if (!session) return

    const { data: meds } = await supabase
      .from('medications')
      .select('*')

    if (!meds) return

    const now = new Date()
    const currentHourMin = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    for (const med of meds) {
      const medTime = med.time.substring(0, 5) // HH:mm
      if (medTime === currentHourMin) {
        // Check if already taken today
        const today = now.toISOString().split('T')[0]
        const { data: logs } = await supabase
          .from('medication_logs')
          .select('*')
          .eq('medication_id', med.id)
          .gte('taken_at', `${today}T00:00:00`)

        if (logs && logs.length === 0) {
          sendNotification(med.name)
        }
      }
    }
  }

  const sendNotification = (medName) => {
    if (Notification.permission === "granted") {
      new Notification("¡Hora de tu medicina!", {
        body: `Es momento de tomar: ${medName}`,
        icon: "/vite.svg" // Replace with app icon if available
      })
    }
  }

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
