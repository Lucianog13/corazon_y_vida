import { useState } from 'react'

function HealthDashboard() {
    const [data, setData] = useState({
        weight: '',
        pressure: '',
        glucose: ''
    })
    const [showConfirmation, setShowConfirmation] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setShowConfirmation(true)
        setTimeout(() => setShowConfirmation(false), 3000)
    }

    return (
        <div className="view-animate">
            <header>
                <h1>¡Buen día! ☀️</h1>
                <div className="card" style={{ backgroundColor: 'var(--success-green)', border: '2px solid var(--success-text)' }}>
                    <p style={{ color: 'var(--success-text)', fontWeight: 'bold', fontSize: '1.4rem', margin: 0 }}>
                        👍 Hoy vas muy bien.
                    </p>
                </div>
            </header>

            <div className="card">
                <h2>Registrar mis datos</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Peso (kg)</label>
                        <input
                            type="number"
                            className="input-large"
                            placeholder="Ej: 85"
                            value={data.weight}
                            onChange={(e) => setData({ ...data, weight: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Presión Arterial</label>
                        <input
                            type="text"
                            className="input-large"
                            placeholder="Ej: 120/80"
                            value={data.pressure}
                            onChange={(e) => setData({ ...data, pressure: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Azúcar (Glucemia)</label>
                        <input
                            type="number"
                            className="input-large"
                            placeholder="Ej: 110"
                            value={data.glucose}
                            onChange={(e) => setData({ ...data, glucose: e.target.value })}
                        />
                    </div>

                    <button type="submit" style={{ width: '100%' }}>
                        Guardar datos 💾
                    </button>
                </form>

                {showConfirmation && (
                    <div className="view-animate" style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        textAlign: 'center',
                        backgroundColor: 'var(--success-green)',
                        borderRadius: '12px'
                    }}>
                        ✅ Datos guardados correctamente
                    </div>
                )}
            </div>

            <div className="card" style={{ backgroundColor: '#fff3e0' }}>
                <h3>💡 Recordatorio</h3>
                <p>No olvides tomar tus medicamentos hoy.</p>
            </div>
        </div>
    )
}

export default HealthDashboard
