import { NavLink } from 'react-router-dom'
import { Home, ClipboardList, Activity, Settings } from 'lucide-react'

export default function BottomNav() {
    const navItems = [
        { to: '/', icon: Home, label: 'Inicio' },
        { to: '/progreso', icon: Activity, label: 'Salud' },
        { to: '/medicinas', icon: ClipboardList, label: 'Historial' },
        { to: '/ajustes', icon: Settings, label: 'Ajustes' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-4 z-50">
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-500'
                        }`
                    }
                >
                    <Icon className="w-8 h-8" />
                    <span className="text-xs font-semibold">{label}</span>
                </NavLink>
            ))}
        </nav>
    )
}
