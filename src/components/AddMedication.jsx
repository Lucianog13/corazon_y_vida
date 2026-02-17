import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Save, Pill as PillIcon } from 'lucide-react'

export default function AddMedication({ onSave, onClose }) {
    const [name, setName] = useState('')
    const [dosage, setDosage] = useState('')
    const [time, setTime] = useState('08:00')
    const [instructions, setInstructions] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('medications')
            .insert({
                user_id: user.id,
                name: name.toUpperCase(),
                dosage: dosage.toUpperCase(),
                time,
                instructions,
                icon_color: 'text-blue-500',
                bg_color: 'bg-blue-500/10'
            })

        if (!error) {
            onSave()
            onClose()
        } else {
            console.error(error)
            alert('Error al guardar: ' + error.message)
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-slate-900 w-full max-w-md rounded-[3rem] border-2 border-slate-800 p-8 space-y-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full">
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-500/20 p-4 rounded-3xl">
                        <PillIcon className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-black">NUEVA MEDICINA</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-slate-500 font-bold uppercase text-xs tracking-widest pl-2">Nombre</label>
                        <input
                            required
                            className="w-full bg-slate-800 p-6 rounded-[2rem] text-xl font-bold border-2 border-transparent focus:border-blue-500 outline-none"
                            placeholder="Ej: ASPIRINA"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-500 font-bold uppercase text-xs tracking-widest pl-2">Dosis</label>
                        <input
                            required
                            className="w-full bg-slate-800 p-6 rounded-[2rem] text-xl font-bold border-2 border-transparent focus:border-blue-500 outline-none"
                            placeholder="Ej: 1 TABLETA"
                            value={dosage}
                            onChange={e => setDosage(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-500 font-bold uppercase text-xs tracking-widest pl-2">Hora</label>
                        <input
                            required
                            type="time"
                            className="w-full bg-slate-800 p-6 rounded-[2rem] text-2xl font-black border-2 border-transparent focus:border-blue-500 outline-none"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-500 font-bold uppercase text-xs tracking-widest pl-2">Instrucciones</label>
                        <textarea
                            className="w-full bg-slate-800 p-6 rounded-[2rem] text-lg font-bold border-2 border-transparent focus:border-blue-500 outline-none min-h-[100px]"
                            placeholder="Ej: Tomar con agua"
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full elderly-btn bg-blue-500 mt-4 disabled:opacity-50"
                    >
                        <Save className="w-8 h-8" />
                        {loading ? 'GUARDANDO...' : 'GUARDAR MEDICINA'}
                    </button>
                </form>
            </div>
        </div>
    )
}
