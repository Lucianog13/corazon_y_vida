import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, UserPlus, Heart } from 'lucide-react'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState(null)

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                alert('Revisa tu correo para confirmar el registro!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="bg-blue-500/20 p-6 rounded-full">
                        <Heart className="w-16 h-16 text-blue-500 fill-blue-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold tracking-tight">Corazón y Vida</h1>
                <p className="text-slate-400 text-lg">Tu compañero de salud diario</p>

                <form onSubmit={handleAuth} className="mt-8 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className="w-full p-6 rounded-2xl bg-slate-900 border-2 border-slate-800 text-xl focus:border-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="w-full p-6 rounded-2xl bg-slate-900 border-2 border-slate-800 text-xl focus:border-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full elderly-btn bg-blue-600 hover:bg-blue-700 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Entrar'}
                        {isSignUp ? <UserPlus className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
                    </button>
                </form>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-400 font-semibold text-lg hover:underline"
                >
                    {isSignUp ? '¿Ya tienes cuenta? Entrar' : '¿No tienes cuenta? Regístrate gratis'}
                </button>
            </div>
        </div>
    )
}
