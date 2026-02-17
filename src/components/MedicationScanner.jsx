import { useState, useRef, useEffect } from 'react'
import { Camera, X, Check, RefreshCw, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import * as tmImage from '@teachablemachine/image'
import Tesseract from 'tesseract.js'

export default function MedicationScanner({ onSave, onClose }) {
    const [isScanning, setIsScanning] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const modelRef = useRef(null)

    // Load Teachable Machine Model (Step A)
    // NOTE: Replace with your actual model URL
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/p_v0p9X0-/"

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }

                // Load model parallelly
                try {
                    const checkpointURL = MODEL_URL + "model.json"
                    const metadataURL = MODEL_URL + "metadata.json"
                    modelRef.current = await tmImage.load(checkpointURL, metadataURL)
                    console.log("TM Model loaded")
                } catch (e) {
                    console.warn("Could not load TM model, skipping classification step A", e)
                }
            } catch (err) {
                setError("Error al acceder a la cámara: " + err.message)
            }
        }
        startCamera()

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const processCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return

        setIsProcessing(true)
        setError(null)

        try {
            const canvas = canvasRef.current
            const video = videoRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)

            // Step A: Classification (Is it a medicine?)
            if (modelRef.current) {
                const prediction = await modelRef.current.predict(canvas)
                const isMedicine = prediction.find(p => p.className === "Medicamento" && p.probability > 0.6)
                if (!isMedicine) {
                    // We'll warn but allow proceeding for now to be helpful
                    console.log("Classification suggest not a medicine")
                }
            }

            // Step B: Identification (OCR)
            const { data: { text } } = await Tesseract.recognize(canvas, 'spa')

            // Step C: Vademecum Lookup & Cleaning
            const foundName = extractMedicationName(text)

            setResult({
                name: foundName,
                fullContent: text
            })
            setIsScanning(false)
        } catch (err) {
            setError("Error al procesar: " + err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const extractMedicationName = (text) => {
        const dictionary = [
            "ASPIRINA", "PARACETAMOL", "IBUPROFENO", "ENALAPRIL",
            "METFORMINA", "ATORVASTATINA", "LOSARTAN", "AMOXICILINA",
            "DICLOFENAC", "SERETIDE", "VENTOLIN", "AEROMAR"
        ]

        const cleanText = text.toUpperCase()
        // Check if any dictionary word is in the text
        const match = dictionary.find(med => cleanText.includes(med))
        if (match) return match

        // Fallback: take the first long word of the first non-empty line
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3)
        if (lines.length > 0) {
            const firstLineWords = lines[0].split(' ').filter(w => w.length > 4)
            return firstLineWords[0]?.toUpperCase() || "MEDICAMENTO"
        }

        return "MEDICAMENTO"
    }

    const saveMedication = async (frequency) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !result) return

        const { error } = await supabase
            .from('medications')
            .insert({
                user_id: user.id,
                name: result.name,
                dosage: "Consultar médico",
                time: "08:00:00", // Default
                instructions: `Frecuencia: Cada ${frequency} horas`,
                icon_color: 'text-blue-500',
                bg_color: 'bg-blue-500/10'
            })

        if (!error) {
            onSave()
            onClose()
        } else {
            setError("Error al guardar en base de datos")
        }
    }

    return (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col p-6 text-white overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black uppercase">Escáner Inteligente</h2>
                <button onClick={onClose} className="p-2 bg-slate-900 rounded-full">
                    <X className="w-8 h-8" />
                </button>
            </div>

            {isScanning ? (
                <div className="space-y-6 flex-1 flex flex-col">
                    <div className="relative aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-blue-500 shadow-2xl shadow-blue-500/20">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border-[40px] border-slate-950/40 pointer-events-none flex items-center justify-center">
                            <div className="w-full h-1 bg-blue-500 animate-pulse"></div>
                        </div>
                    </div>

                    <p className="text-center text-slate-400 font-bold text-xl px-4">
                        Apunta la cámara a la caja de la medicina y mantén pulso firme.
                    </p>

                    <button
                        onClick={processCapture}
                        disabled={isProcessing}
                        className="w-full elderly-btn bg-blue-600 py-10"
                    >
                        {isProcessing ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Camera className="w-10 h-10" />}
                        <span className="text-3xl uppercase font-black">
                            {isProcessing ? "Procesando..." : "Escanear Ahora"}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-emerald-500/10 border-4 border-emerald-500 rounded-[3rem] p-8 text-center">
                        <div className="bg-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Check className="w-12 h-12 text-slate-950 stroke-[3]" />
                        </div>
                        <p className="text-emerald-500 font-black text-sm uppercase tracking-widest mb-2">Medicina Identificada</p>
                        <h3 className="text-5xl font-black leading-tight mb-4">{result?.name}</h3>
                        <p className="text-slate-400 font-medium">¿Es correcto este nombre?</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xl font-bold pl-4 text-blue-400">¿Cada cuánto debes tomarla?</p>
                        <div className="grid grid-cols-2 gap-4">
                            {[8, 12, 24].map(h => (
                                <button
                                    key={h}
                                    onClick={() => saveMedication(h)}
                                    className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[2rem] text-2xl font-black hover:border-blue-500 active:scale-95 transition-all"
                                >
                                    Cada {h}hs
                                </button>
                            ))}
                            <button
                                onClick={() => setIsScanning(true)}
                                className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[2rem] text-2xl font-black flex items-center justify-center gap-2 text-slate-500"
                            >
                                <RefreshCw className="w-6 h-6" /> Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-6 p-6 bg-red-500/10 border-2 border-red-500 rounded-[2rem] text-red-500 font-bold text-center">
                    {error}
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
}
