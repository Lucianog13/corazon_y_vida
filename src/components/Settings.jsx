import { supabase } from '../lib/supabase'
import { LogOut, User, Save, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Settings() {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()
                if (data) setName(data.full_name)
            }
        }
        fetchProfile()
    }, [])

    const handleUpdate = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: name })
            .eq('id', user.id)

        if (!error) alert('¡Perfil actualizado!')
        setLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="p-6 space-y-8 max-w-lg mx-auto bg-slate-950 min-h-screen text-white">
            <h1 className="text-4xl font-black border-b-4 border-blue-500 pb-4 inline-block">Ajustes</h1>

            <div className="space-y-6">
                <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[3rem] space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-4 rounded-full">
                            <User className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black uppercase text-slate-500">Tu Perfil</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black tracking-widest pl-2 uppercase text-slate-500">Tu Nombre</label>
                        <input
                            className="w-full bg-slate-800 p-6 rounded-[2rem] text-xl font-bold border-2 border-transparent focus:border-blue-500 outline-none"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full elderly-btn bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                    >
                        <Save className="w-8 h-8" />
                        {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </button>
                </div>

                <div className="bg-red-500/10 border-2 border-red-500/20 p-8 rounded-[3rem] space-y-6">
                    <p className="text-slate-400 font-bold text-center">¿Deseas cerrar la sesión?</p>
                    <button
                        onClick={handleLogout}
                        className="w-full elderly-btn bg-red-600 hover:bg-red-700"
                    >
                        <LogOut className="w-8 h-8" />
                        SALIR DE LA APP
                    </button>
                </div>
            </div>

            <p className="text-center text-slate-600 font-bold mt-12">Corazón y Vida v1.0.0</p>
        </div>
    )
}
