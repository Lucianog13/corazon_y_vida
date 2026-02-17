import { useState, useEffect } from 'react'

function Profile() {
    const [userData, setUserData] = useState({
        nombre: '',
        edad: '',
        peso: '',
        presionSistolica: '',
        presionDiastolica: '',
    })

    const [history, setHistory] = useState([])
    const [stats, setStats] = useState({
        pasosTotales: 0,
        comidasRegistradas: 0,
        aguaTotal: 0
    })

    useEffect(() => {
        const savedData = localStorage.getItem('user_profile')
        if (savedData) setUserData(JSON.parse(savedData))

        const savedStats = localStorage.getItem('daily_stats')
        if (savedStats) setStats(JSON.parse(savedStats))

        const savedHistory = localStorage.getItem('health_history')
        if (savedHistory) setHistory(JSON.parse(savedHistory))
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        const newData = { ...userData, [name]: value }
        setUserData(newData)
        localStorage.setItem('user_profile', JSON.stringify(newData))
    }

    const registrarHoy = () => {
        if (!userData.peso || !userData.presionSistolica) {
            alert("Por favor completa el peso y la presión antes de registrar")
            return
        }

        const nuevoRegistro = {
            fecha: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            peso: parseFloat(userData.peso),
            presion: `${userData.presionSistolica}/${userData.presionDiastolica}`,
            edad: userData.edad
        }

        const nuevoHistorial = [nuevoRegistro, ...history]
        setHistory(nuevoHistorial)
        localStorage.setItem('health_history', JSON.stringify(nuevoHistorial))
        alert("¡Métricas registradas con éxito! 📊")
    }

    const calcularEvolucion = () => {
        if (history.length < 2) return null
        const actual = history[0]
        const anterior = history[1]

        const difPeso = actual.peso - anterior.peso

        return {
            peso: difPeso < 0 ? 'Mejora (Bajaste de peso) 📉' : difPeso > 0 ? 'Subiste de peso 📈' : 'Peso estable ⚖️',
            status: difPeso <= 0 ? 'success' : 'warning'
        }
    }

    const evolucion = calcularEvolucion()

    return (
        <div className="view-animate">
            <header>
                <h1>Mi Perfil y Evolución ❤️</h1>
                <p>Tu seguimiento médico diario</p>
            </header>

            <div className="card">
                <h3>📝 Registro Diario de Salud</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <label>
                        Nombre:
                        <input type="text" name="nombre" value={userData.nombre} onChange={handleChange} className="input-large" style={{ fontSize: '1rem', padding: '10px' }} />
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ flex: 1 }}>
                            Edad:
                            <input type="number" name="edad" value={userData.edad} onChange={handleChange} className="input-large" style={{ fontSize: '1rem', padding: '10px' }} />
                        </label>
                        <label style={{ flex: 1 }}>
                            Peso (kg):
                            <input type="number" name="peso" value={userData.peso} onChange={handleChange} className="input-large" style={{ fontSize: '1rem', padding: '10px' }} />
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ flex: 1 }}>
                            Presión Sistólica (Alta):
                            <input type="number" name="presionSistolica" value={userData.presionSistolica} onChange={handleChange} placeholder="Ej: 120" className="input-large" style={{ fontSize: '1rem', padding: '10px' }} />
                        </label>
                        <label style={{ flex: 1 }}>
                            Presión Diastólica (Baja):
                            <input type="number" name="presionDiastolica" value={userData.presionDiastolica} onChange={handleChange} placeholder="Ej: 80" className="input-large" style={{ fontSize: '1rem', padding: '10px' }} />
                        </label>
                    </div>
                    <button onClick={registrarHoy} style={{ background: 'var(--secondary-blue)', marginTop: '0.5rem' }}>
                        Registrar Métricas de Hoy 💾
                    </button>
                </div>
            </div>

            {evolucion && (
                <div className="card" style={{ borderLeft: `8px solid ${evolucion.status === 'success' ? '#4caf50' : '#ff9800'}` }}>
                    <h3>📈 Análisis de Evolución</h3>
                    <p style={{ fontWeight: 'bold' }}>{evolucion.peso}</p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Comparado con tu registro anterior.</p>
                </div>
            )}

            <div className="card" style={{ background: '#f5f5f5' }}>
                <h3>📜 Historial Reciente</h3>
                {history.length === 0 ? (
                    <p style={{ color: '#999' }}>Aún no hay registros en la base de datos.</p>
                ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '8px' }}>Fecha</th>
                                    <th style={{ padding: '8px' }}>Peso</th>
                                    <th style={{ padding: '8px' }}>Presión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px', fontSize: '0.9rem' }}>{h.fecha}</td>
                                        <td style={{ padding: '8px', fontSize: '0.9rem' }}>{h.peso}kg</td>
                                        <td style={{ padding: '8px', fontSize: '0.9rem' }}>{h.presion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card" style={{ backgroundColor: 'var(--primary-red)', color: 'white' }}>
                <h3>🏆 Actividad Total</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '1rem' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.pasosTotales}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>Pasos</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.comidasRegistradas}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>Comidas</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.aguaTotal}L</p>
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>Agua</p>
                    </div>
                </div>
            </div>

            <button
                className="secondary"
                style={{ width: '100%', marginBottom: '2rem' }}
                onClick={() => {
                    if (confirm("¿Estás seguro de borrar toda tu base de datos?")) {
                        localStorage.clear()
                        window.location.reload()
                    }
                }}
            >
                Borrar Base de Datos 🗑️
            </button>
        </div>
    )
}

export default Profile
