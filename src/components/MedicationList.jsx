import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Pill, CheckCircle2, Plus, Trash2, Camera } from 'lucide-react'
import AddMedication from './AddMedication'
import MedicationScanner from './MedicationScanner'

export default function MedicationList() {
    const [medications, setMedications] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const [missedMeds, setMissedMeds] = useState([])

    useEffect(() => {
        fetchMedications()

        // Interval to check for missed meds every minute
        const interval = setInterval(checkMissedMeds, 60000)
        return () => clearInterval(interval)
    }, [])

    const fetchMedications = async () => {
        const { data: meds, error } = await supabase
            .from('medications')
            .select(`
                *,
                medication_logs(taken_at)
            `)
            .order('time', { ascending: true })

        if (meds) {
            const today = new Date().toISOString().split('T')[0]
            const processedMeds = meds.map(m => {
                const logsToday = m.medication_logs?.filter(l => l.taken_at.startsWith(today))
                const latestLog = logsToday?.length > 0 ? logsToday.sort((a, b) => new Date(b.taken_at) - new Date(a.taken_at))[0] : null
                return {
                    ...m,
                    taken: logsToday?.length > 0,
                    completed: latestLog ? new Date(latestLog.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
                }
            })
            setMedications(processedMeds)
            // Initial check
            calculateMissed(processedMeds)
        }
        setLoading(false)
    }

    const calculateMissed = (meds) => {
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]

        const missed = meds.filter(m => {
            if (m.taken) return false

            // Create a Date object for the scheduled time
            const [hours, minutes] = m.time.split(':')
            const scheudledDate = new Date(`${todayStr}T${hours}:${minutes}:00`)

            // It's missed if more than 30 minutes passed
            const thirtyMinsInMs = 30 * 60 * 1000
            return (now.getTime() - scheudledDate.getTime()) > thirtyMinsInMs
        })

        setMissedMeds(missed)
    }

    const checkMissedMeds = () => {
        calculateMissed(medications)
    }

    const toggleTaken = async (medId) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('medication_logs')
            .insert({ medication_id: medId, user_id: user.id })

        if (!error) fetchMedications()
    }

    const deleteMed = async (id) => {
        if (!confirm('¿Seguro que quieres borrar esta medicina?')) return
        const { error } = await supabase.from('medications').delete().eq('id', id)
        if (!error) fetchMedications()
    }

    if (loading) return <div className="p-6 text-center text-2xl font-bold bg-slate-950 min-h-screen text-white uppercase italic">Cargando medicinas...</div>

    const todayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric' }).format(new Date())

    return (
        <div className="p-6 space-y-6 max-w-lg mx-auto bg-slate-950 min-h-screen text-white pb-24">
            {showAdd && <AddMedication onSave={fetchMedications} onClose={() => setShowAdd(false)} />}
            {showScanner && <MedicationScanner onSave={fetchMedications} onClose={() => setShowScanner(false)} />}

            {/* Header */}
            <div className="flex justify-between items-center py-4">
                <div className="text-left">
                    <p className="text-blue-400 font-bold tracking-widest text-sm mb-1 uppercase">Hoy es</p>
                    <h1 className="text-4xl font-black uppercase leading-none">{todayName}</h1>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowScanner(true)}
                        className="bg-emerald-600 p-4 rounded-full shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform"
                        title="Escanear medicina"
                    >
                        <Camera className="w-8 h-8" />
                    </button>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/20 active:scale-90 transition-transform"
                        title="Añadir medicina manual"
                    >
                        <Plus className="w-8 h-8" />
                    </button>
                </div>
            </div>

            {/* Missed Meds Warning */}
            {missedMeds.length > 0 && (
                <div className="bg-red-600 border-4 border-white/20 rounded-[2rem] p-6 shadow-xl shadow-red-600/20 animate-bounce">
                    <p className="text-white font-black text-xs uppercase tracking-widest mb-1">¡Atención!</p>
                    <h3 className="text-2xl font-black text-white leading-tight">
                        No has tomado: {missedMeds.map(m => m.name).join(', ')}
                    </h3>
                    <p className="text-red-100 font-bold mt-1 italic">Tómalas pronto para no perder tu tratamiento.</p>
                </div>
            )}

            {/* Quick Scanner Action Callout */}
            <button
                onClick={() => setShowScanner(true)}
                className="w-full bg-emerald-500/10 border-2 border-emerald-500 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-emerald-500/20 transition-all"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="bg-emerald-500 p-3 rounded-2xl">
                        <Camera className="w-8 h-8 text-slate-950" />
                    </div>
                    <div>
                        <p className="text-emerald-500 font-black tracking-widest text-xs uppercase">Nuevo</p>
                        <h3 className="text-2xl font-black">ESCANEAR CAJA</h3>
                    </div>
                </div>
                <div className="text-emerald-500 group-hover:translate-x-2 transition-transform">
                    <Plus className="w-8 h-8" />
                </div>
            </button>

            <div className="space-y-6">
                {medications.length === 0 ? (
                    <div className="text-center p-12 bg-slate-900 rounded-[2.5rem] border-2 border-slate-800">
                        <Pill className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 text-xl font-bold italic">Toca para escanear o usa el botón + para añadir una medicina.</p>
                    </div>
                ) : (
                    medications.map((med) => (
                        <div
                            key={med.id}
                            className={`relative bg-slate-900 border-2 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all ${!med.taken ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-800 opacity-60'
                                }`}
                        >
                            <button
                                onClick={() => deleteMed(med.id)}
                                className="absolute top-6 right-6 p-2 text-slate-600 hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-6 h-6" />
                            </button>

                            {!med.taken && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                                    Próxima Toma
                                </div>
                            )}

                            <div className={`p-6 rounded-full ${med.bg_color || 'bg-blue-500/10'} mb-4 uppercase`}>
                                <Pill className={`w-12 h-12 ${med.icon_color || 'text-blue-500'}`} />
                            </div>

                            <h2 className={`text-4xl font-black mb-1 ${med.taken ? 'line-through' : ''}`}>
                                {med.name}
                            </h2>
                            <p className="text-slate-400 font-bold text-xl mb-4">
                                {med.dosage} • {med.time?.substring(0, 5)}
                            </p>

                            {med.instructions && !med.taken && (
                                <p className="text-blue-400 font-medium text-lg mb-6 leading-tight">
                                    {med.instructions}
                                </p>
                            )}

                            {med.taken ? (
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-xl mt-2 italic">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span>COMPLETADO A LAS {med.completed}</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => toggleTaken(med.id)}
                                    className="w-full elderly-btn bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4"
                                >
                                    <CheckCircle2 className="w-8 h-8" />
                                    YA LA TOMÉ
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
