import { ArrowLeft, Check, Footprints, Activity, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function HealthMonitor() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ steps: 0, goal: 6000, yesterday: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]
        const { data: todayData } = await supabase
            .from('daily_steps')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        const { data: yesterdayData } = await supabase
            .from('daily_steps')
            .select('steps')
            .eq('user_id', user.id)
            .eq('date', yesterdayStr)
            .single()

        setStats({
            steps: todayData?.steps || 0,
            goal: todayData?.goal || 6000,
            yesterday: yesterdayData?.steps || 0
        })
        setLoading(false)
    }

    if (loading) return <div className="p-6 text-center text-2xl font-bold bg-slate-950 min-h-screen text-white">Cargando progreso...</div>

    return (
        <div className="p-6 space-y-8 max-w-lg mx-auto bg-slate-950 min-h-screen text-white">
            {/* Header */}
            <div className="flex items-center py-4">
                <button onClick={() => navigate(-1)} className="bg-slate-900 p-4 rounded-full border border-slate-800">
                    <ArrowLeft className="w-8 h-8" />
                </button>
                <h1 className="flex-1 text-center text-3xl font-black">Estado de hoy</h1>
            </div>

            {/* Circle Progress */}
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-64 h-64 flex items-center justify-center">
                    <div className="absolute inset-0 border-8 border-slate-900 rounded-full"></div>
                    <div
                        className="absolute inset-0 border-8 border-emerald-500 rounded-full"
                        style={{ clipPath: stats.steps >= stats.goal ? 'none' : 'inset(0 0 0 0)' }}
                    ></div>

                    <div className="bg-emerald-500 p-12 rounded-full shadow-2xl shadow-emerald-500/20">
                        <Check className="w-24 h-24 text-slate-950 stroke-[4px]" />
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-5xl font-black text-emerald-500 tracking-tight">
                        {stats.steps >= stats.goal ? '¡META LOGRADA!' : 'VAS MUY BIEN'}
                    </h2>
                    <p className="text-slate-400 text-xl font-bold mt-2 italic">
                        {stats.steps >= stats.goal ? '¡Qué gran esfuerzo!' : '¡Sigue así, vas por buen camino!'}
                    </p>
                </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[3rem] p-10 space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-slate-500 font-black tracking-widest text-sm mb-1 uppercase">HOY</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-blue-400">{stats.steps.toLocaleString()}</span>
                            <span className="text-slate-500 font-bold text-xl uppercase">PASOS</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 font-black tracking-widest text-sm mb-1 uppercase">AYER</p>
                        <div className="flex items-baseline gap-2 justify-end">
                            <span className="text-4xl font-black text-slate-400">{stats.yesterday.toLocaleString()}</span>
                            <span className="text-slate-500 font-bold">PASOS</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between font-bold text-xl">
                        <span>Meta: {stats.goal.toLocaleString()} pasos</span>
                        <span className="text-emerald-500">{Math.round((stats.steps / stats.goal) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-8 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full rounded-full shadow-lg shadow-blue-500/50 transition-all duration-500"
                            style={{ width: `${Math.min(100, (stats.steps / stats.goal) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button className="w-full elderly-btn bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 py-8">
                <span className="text-2xl">Ver más detalle</span>
                <Activity className="w-8 h-8" />
            </button>

            {/* Achievement Alert */}
            {stats.steps > stats.yesterday && (
                <div className="bg-emerald-950/30 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                        <Star className="w-6 h-6 text-emerald-500 fill-emerald-500" />
                    </div>
                    <p className="text-emerald-400 font-bold text-lg leading-tight">
                        ¡Has superado tu marca de ayer!
                    </p>
                </div>
            )}
        </div>
    )
}
