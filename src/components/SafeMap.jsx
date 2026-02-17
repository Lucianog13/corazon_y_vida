import { useEffect } from 'react'

function SafeMap() {
    useEffect(() => {
        // Basic check if Leaflet is already loaded, otherwise load it
        if (!window.L) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)

            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = initMap
            document.head.appendChild(script)
        } else {
            initMap()
        }

        function initMap() {
            const mapDiv = document.getElementById('map')
            if (!mapDiv || mapDiv._leaflet_id) return

            // Default position (Buenos Aires) if geo fails
            let userPos = [-34.6037, -58.3816]

            const map = window.L.map('map').setView(userPos, 15)
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map)

            // Try to get real location
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords
                    userPos = [latitude, longitude]
                    map.setView(userPos, 16)

                    window.L.marker(userPos).addTo(map)
                        .bindPopup('Tu ubicación actual 📍')
                        .openPopup()

                    // Mock a "Safe Route" relative to user position
                    const safeRoute = [
                        [latitude, longitude],
                        [latitude + 0.002, longitude + 0.002],
                        [latitude + 0.004, longitude + 0.001]
                    ]
                    window.L.polyline(safeRoute, { color: 'var(--secondary-blue)', weight: 6 }).addTo(map)
                    window.L.marker(safeRoute[2]).addTo(map).bindPopup('Destino Seguro (Plano)')
                }, (error) => {
                    console.error("Error getting location:", error)
                    // Fallback to default
                    window.L.marker(userPos).addTo(map).bindPopup('Ubicación predeterminada').openPopup()
                })
            }
        }
    }, [])

    return (
        <div className="view-animate">
            <header>
                <h1>Mapa Seguro 🗺️</h1>
                <p>Caminos planos y sin pendientes cerca de vos</p>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '400px' }}>
                <div id="map" style={{ height: '100%', width: '100%' }}></div>
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
                <h3>🚀 Ruta Recomendada</h3>
                <p>Este recorrido de 15 minutos es totalmente plano y tiene bancos para descansar cada 200 metros.</p>
                <button style={{ width: '100%' }}>¿Cómo llegar al inicio? 📍</button>
            </div>
        </div>
    )
}

export default SafeMap
