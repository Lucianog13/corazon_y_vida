import { useState, useEffect, useRef } from 'react'
import { Footprints, Pill, Target, User, Square, Play } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ userEmail }) {
    const [userName, setUserName] = useState('')
    const [stats, setStats] = useState({ steps: 0, goal: 6000, duration: 0 })

    // Tracking states
    const [isTracking, setIsTracking] = useState(false)
    const [sessionSteps, setSessionSteps] = useState(0)
    const [seconds, setSeconds] = useState(0)

    // Refs for detection
    const lastUpdate = useRef(0)
    const lastStepTime = useRef(0)
    const timerRef = useRef(null)

    useEffect(() => {
        const fetchAll = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Profile
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
                if (profile) setUserName(profile.full_name)
                else setUserName(userEmail.split('@')[0])

                // Steps
                const today = new Date().toISOString().split('T')[0]
                const { data: stepData } = await supabase.from('daily_steps').select('*').eq('user_id', user.id).eq('date', today).single()
                if (stepData) setStats({ steps: stepData.steps, goal: stepData.goal, duration: stepData.duration || 0 })
            }
        }
        fetchAll()

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            window.removeEventListener('devicemotion', handleMotion)
        }
    }, [userEmail])

    const handleMotion = (event) => {
        const acc = event.accelerationIncludingGravity
        if (!acc) return

        const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z)
        const now = Date.now()

        // Algorithm: Threshold > 12 and at least 300ms since last step
        if (magnitude > 12.5 && (now - lastStepTime.current) > 350) {
            setSessionSteps(prev => prev + 1)
            lastStepTime.current = now
        }
    }

    const startTracking = async () => {
        try {
            // Request permission for iOS 13+
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const permission = await DeviceMotionEvent.requestPermission()
                if (permission !== 'granted') {
                    alert('Se necesita permiso para usar los sensores de movimiento.')
                    return
                }
            }

            setIsTracking(true)
            setSessionSteps(0)
            setSeconds(0)

            window.addEventListener('devicemotion', handleMotion)

            timerRef.current = setInterval(() => {
                setSeconds(s => s + 1)
            }, 1000)

        } catch (err) {
            console.error(err)
            alert('Error al acceder a los sensores: ' + err.message)
        }
    }

    const stopTracking = async () => {
        setIsTracking(false)
        window.removeEventListener('devicemotion', handleMotion)
        if (timerRef.current) clearInterval(timerRef.current)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]
        const totalStepsToday = stats.steps + sessionSteps
        const totalDurationToday = (stats.duration || 0) + seconds

        const { error } = await supabase
            .from('daily_steps')
            .upsert({
                user_id: user.id,
                date: today,
                steps: totalStepsToday,
                duration: totalDurationToday,
                goal: stats.goal
            }, { onConflict: 'user_id, date' })

        if (!error) {
            setStats(prev => ({
                ...prev,
                steps: totalStepsToday,
                duration: totalDurationToday
            }))
            alert(`¡Caminata guardada! Pasos: ${sessionSteps}, Tiempo: ${formatTime(seconds)}`)
        }
    }

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    return (
        <div className="p-6 space-y-8 max-w-lg mx-auto bg-slate-950 min-h-screen text-white pb-24">
            {/* Header */}
            <div className="flex flex-col items-center space-y-4 pt-8">
                <div className="bg-slate-800 p-4 rounded-full border-2 border-slate-700 shadow-xl">
                    <User className="w-12 h-12 text-slate-400" />
                </div>
                <div className="text-center">
                    <h1 className="text-5xl font-bold">Hola {userName}</h1>
                    <p className="text-blue-400 text-2xl mt-2 font-medium">¿Cómo te sientes hoy?</p>
                </div>
            </div>

            {/* Tracking UI */}
            {isTracking ? (
                <div className="bg-red-500/10 border-4 border-red-500 rounded-[3rem] p-8 text-center space-y-6 animate-pulse">
                    <div className="flex justify-center gap-8 items-center">
                        <div className="text-left">
                            <p className="text-red-500 font-black text-sm uppercase tracking-widest">PASOS</p>
                            <h2 className="text-6xl font-black">{sessionSteps}</h2>
                        </div>
                        <div className="h-12 w-1 bg-red-500/20"></div>
                        <div className="text-left">
                            <p className="text-red-500 font-black text-sm uppercase tracking-widest">TIEMPO</p>
                            <h2 className="text-6xl font-black">{formatTime(seconds)}</h2>
                        </div>
                    </div>

                    <button
                        onClick={stopTracking}
                        className="w-full elderly-btn bg-red-600 hover:bg-red-700 shadow-red-600/20 py-10"
                    >
                        <Square className="w-12 h-12 fill-white" />
                        <span className="text-3xl">DETENER</span>
                    </button>
                </div>
            ) : (
                <button
                    onClick={startTracking}
                    className="w-full elderly-btn bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 py-12 flex-col gap-4"
                >
                    <Footprints className="w-16 h-16" />
                    <span className="text-3xl">REGISTRAR CAMINATA</span>
                </button>
            )}

            {/* Status Cards */}
            <div className="space-y-4">
                <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-[2.5rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-500/20 p-4 rounded-3xl">
                            <Pill className="w-10 h-10 text-red-500" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">PRÓXIMA MEDICINA</p>
                            <h2 className="text-4xl font-black italic">PRÓXIMAMENTE</h2>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-[2.5rem] space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500/20 p-4 rounded-3xl">
                            <Target className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-sm text-right">MI META DE SALUD</p>
                            <h2 className="text-5xl font-black text-right">{Math.round((stats.steps / stats.goal) * 100)}%</h2>
                        </div>
                    </div>
                    <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (stats.steps / stats.goal) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 font-bold text-lg">
                        <span>{formatTime(stats.duration)} caminados</span>
                        <span>{stats.steps.toLocaleString()} / {stats.goal.toLocaleString()} pasos</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
