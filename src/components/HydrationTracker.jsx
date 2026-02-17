import { useState } from 'react'

function HydrationTracker() {
    const [glasses, setGlasses] = useState(0)
    const totalGoal = 8 // 8 glasses of 250ml = 2 Liters

    const addGlass = () => {
        if (glasses < totalGoal) setGlasses(glasses + 1)
    }

    const removeGlass = () => {
        if (glasses > 0) setGlasses(glasses - 1)
    }

    const percentage = (glasses / totalGoal) * 100

    return (
        <div className="view-animate">
            <header>
                <h1>Mi Hidratación 💧</h1>
                <p>Tu objetivo: 2 litros de agua por día</p>
            </header>

            <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    transition: 'transform 0.3s'
                }}>
                    {glasses >= totalGoal ? '🎉' : '🥤'}
                </div>

                <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>
                    {glasses} / {totalGoal} vasos
                </h2>

                <p style={{ color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
                    {glasses >= totalGoal ? '¡Objetivo cumplido! 👏' : `Te faltan ${totalGoal - glasses} vasos`}
                </p>

                <div style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: 'var(--primary-blue)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--secondary-blue)',
                        transition: 'width 0.5s ease-in-out'
                    }}></div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="secondary"
                        style={{ flex: 1 }}
                        onClick={removeGlass}
                    >
                        Quitar ➖
                    </button>
                    <button
                        style={{ flex: 2 }}
                        onClick={addGlass}
                    >
                        Tomé un vaso ➕
                    </button>
                </div>
            </div>

            <div className="card" style={{ backgroundColor: '#e3f2fd' }}>
                <h3>⭐ Consejo</h3>
                <p>Toma agua aunque no tengas sed, ayuda a tu corazón.</p>
            </div>
        </div>
    )
}

export default HydrationTracker
