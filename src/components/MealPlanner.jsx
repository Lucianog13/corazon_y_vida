import { useState } from 'react'

const RECETAS_ARGENTINAS = [
    {
        nombre: "Zapallitos Rellenos con Pollo",
        ingredientes: "Zapallitos redondos, pechuga de pollo picada, cebolla, morrón, arroz integral, condimentos sin sal.",
        calorias: 350,
        carbos: "30g",
        consejo: "Usá orégano y pimienta para dar sabor sin sal."
    },
    {
        nombre: "Milanesas de Carne al Horno",
        ingredientes: "Bola de lomo magra, pan rallado integral, provenzal sin sal, huevo. Acompañar con ensalada.",
        calorias: 420,
        carbos: "40g",
        consejo: "No uses aceite frito, hacelas bien al horno con un poco de rocío vegetal."
    },
    {
        nombre: "Guiso de Lentejas Saludable",
        ingredientes: "Lentejas, zanahoria, calabaza, cebolla, carne magra en cubitos, caldo casero sin sal.",
        calorias: 380,
        carbos: "45g",
        consejo: "La fibra de las lentejas es excelente para controlar el azúcar."
    },
    {
        nombre: "Pollo al Limón con Batatas",
        ingredientes: "Muslo sin piel, limón, batata al horno, romero.",
        calorias: 400,
        carbos: "35g",
        consejo: "La batata cocida al horno con cáscara tiene menos impacto en la glucemia."
    },
    {
        nombre: "Tarta de Acelga y Humita",
        ingredientes: "Masa integral, acelga picada, choclo desgranado, cebolla, queso port salut light.",
        calorias: 320,
        carbos: "38g",
        consejo: "La acelga aporta calcio y hierro para tu corazón."
    },
    {
        nombre: "Bife de Chorizo Magro con Ensalada Rusa Saludable",
        ingredientes: "Bife de chorizo sin grasa, papa, zanahoria, arvejas, mayonesa light o yogurt natural.",
        calorias: 450,
        carbos: "25g",
        consejo: "Pedí el corte bien magro y controlá el tamaño de la porción."
    },
    {
        nombre: "Canelones de Verdura con Salsa Blanca de Avena",
        ingredientes: "Masa de panqueques con leche descremada, espinaca, ricota descremada, leche de avena.",
        calorias: 370,
        carbos: "42g",
        consejo: "La salsa blanca hecha con avena es mucho más ligera y nutritiva."
    },
    {
        nombre: "Filet de Merluza al Roquefort Light",
        ingredientes: "Merluza fresca, queso azul en poca cantidad, leche descremada, maicena.",
        calorias: 310,
        carbos: "10g",
        consejo: "El pescado aporta Omega 3, esencial para la salud cardíaca."
    },
    {
        nombre: "Pastel de Papas con Calabaza",
        ingredientes: "Carne picada especial (magra), cebolla, puré de calabaza en vez de papa (o mitad y mitad).",
        calorias: 390,
        carbos: "32g",
        consejo: "Usar calabaza reduce las calorías y el índice glucémico del plato."
    },
    {
        nombre: "Ensalada de Quinoa y Vegetales Asados",
        ingredientes: "Quinoa lavada, berenjena, morrón, zuchinni, aceite de oliva virgen.",
        calorias: 340,
        carbos: "48g",
        consejo: "La quinoa es una proteína completa ideal para diabéticos."
    }
]

function MealPlanner() {
    const [recetaActual, setRecetaActual] = useState(RECETAS_ARGENTINAS[0])
    const [registro, setRegistro] = useState([])

    const generarNueva = () => {
        const random = Math.floor(Math.random() * RECETAS_ARGENTINAS.length)
        setRecetaActual(RECETAS_ARGENTINAS[random])
    }

    const registrarComida = () => {
        const nueva = {
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            plato: recetaActual.nombre
        }
        setRegistro([nueva, ...registro])
    }

    return (
        <div className="view-animate">
            <header>
                <h1>Mis Comidas 🍎</h1>
                <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #ef5350' }}>
                    <p style={{ color: '#c62828', fontWeight: 'bold', margin: '0', textAlign: 'center' }}>
                        ❌ PROHIBIDO: SAL Y AZÚCAR REFINADA
                    </p>
                </div>
            </header>

            <div className="card">
                <h2 style={{ color: 'var(--secondary-blue)' }}>💡 ¿Qué puedo comer hoy?</h2>
                <div style={{ borderLeft: '5px solid var(--secondary-blue)', paddingLeft: '1rem', margin: '1rem 0' }}>
                    <h3 style={{ margin: 0 }}>{recetaActual.nombre}</h3>
                    <p style={{ fontSize: '1rem', color: '#666' }}>{recetaActual.ingredientes}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>🔥 {recetaActual.calorias} kcal</span>
                        <span style={{ fontSize: '0.9rem', background: '#eee', padding: '2px 8px', borderRadius: '4px' }}>🥖 {recetaActual.carbos} carbos</span>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '1rem' }}>
                        📌 {recetaActual.consejo}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="secondary" style={{ flex: 1 }} onClick={generarNueva}>Ver otra</button>
                    <button style={{ flex: 2 }} onClick={registrarComida}>Ya comí esto ✅</button>
                </div>
            </div>

            <div className="card">
                <h3>🏠 Mi registro de hoy</h3>
                {registro.length === 0 ? (
                    <p style={{ color: '#999' }}>Aún no registraste comidas hoy.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {registro.map((item, index) => (
                            <li key={index} style={{
                                padding: '0.8rem',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>{item.plato}</span>
                                <span style={{ color: '#999', fontSize: '0.9rem' }}>{item.hora}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default MealPlanner
