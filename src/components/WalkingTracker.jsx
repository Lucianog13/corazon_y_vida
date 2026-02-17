import { useState, useEffect } from 'react'

function WalkingTracker() {
    const [isActive, setIsActive] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [steps, setSteps] = useState(0)

    useEffect(() => {
        let interval = null
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1)
                // Simulated steps: approx 1.5 steps per second at moderate pace
                // Only counts if isActive is true (started by user)
                if (Math.random() > 0.3) {
                    setSteps(steps => steps + 1)
                }
            }, 1000)
        } else {
            if (steps > 0) {
                // Save progress to global stats
                const savedStats = JSON.parse(localStorage.getItem('daily_stats') || '{"pasosTotales":0, "comidasRegistradas":0, "aguaTotal":0}')
                savedStats.pasosTotales += steps
                localStorage.setItem('daily_stats', JSON.stringify(savedStats))
            }
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isActive])

    const formatTime = (totalSeconds) => {
        const min = Math.floor(totalSeconds / 60)
        const sec = totalSeconds % 60
        return `${min}:${sec < 10 ? '0' : ''}${sec}`
    }

    const calories = (steps * 0.04).toFixed(1) // Rough estimation

    return (
        <div className="view-animate">
            <header>
                <h1>Mi Caminata 🚶</h1>
                <p>Caminar fortalece tu corazón</p>
            </header>

            <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Tiempo</p>
                        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{formatTime(seconds)}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Pasos</p>
                        <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{steps}</p>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: 0, fontSize: '1.2rem' }}>🔥 {calories} Calorías</p>
                </div>

                <button
                    onClick={() => setIsActive(!isActive)}
                    style={{
                        width: '100%',
                        backgroundColor: isActive ? '#ef5350' : 'var(--secondary-blue)',
                        fontSize: '1.5rem'
                    }}
                >
                    {isActive ? 'Detener Caminata 🛑' : 'Iniciar Caminata ▶️'}
                </button>
            </div>

            <div className="card" style={{ backgroundColor: '#fffde7', border: '2px solid #fbc02d' }}>
                <h3>⚠️ Atención</h3>
                <p>Si sentís mareos o dolor en el pecho, detenete inmediatamente y descansá.</p>
            </div>

            {!isActive && seconds > 0 && (
                <div className="view-animate card" style={{ backgroundColor: 'var(--success-green)' }}>
                    <p style={{ margin: 0, textAlign: 'center' }}>
                        🎉 ¡Excelente trabajo! Caminaste {formatTime(seconds)} minutos.
                    </p>
                </div>
            )}
        </div>
    )
}

export default WalkingTracker
