import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Activity, Heart, Shield, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function HealthScanPage() {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null); // Keep for single capture fallback if needed
    const [capturedImages, setCapturedImages] = useState([]);
    const [scanPhase, setScanPhase] = useState('idle'); // idle, front, left, right, analyzing, done
    const [isScanning, setIsScanning] = useState(false);
    const [isVoiceOn, setIsVoiceOn] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const start360Scan = () => {
        setResults(null);
        setCapturedImages([]);
        setScanPhase('front');
        setIsScanning(true);
        if (isVoiceOn) speak("Starting 360 degree scan. Please look straight into the camera.");
        else toast('Look straight into the camera', { icon: '📸' });

        let localImages = [];

        // 1. Capture Front
        setTimeout(() => {
            const frontSrc = webcamRef.current.getScreenshot();
            localImages.push(frontSrc);
            setCapturedImages([...localImages]);
            setScanPhase('left');
            if (isVoiceOn) speak("Please turn your head slightly to the left.");
            else toast('Turn head slightly left', { icon: '⬅️' });

            // 2. Capture Left
            setTimeout(() => {
                const leftSrc = webcamRef.current.getScreenshot();
                localImages.push(leftSrc);
                setCapturedImages([...localImages]);
                setScanPhase('right');
                if (isVoiceOn) speak("Now turn your head slightly to the right.");
                else toast('Turn head slightly right', { icon: '➡️' });

                // 3. Capture Right
                setTimeout(() => {
                    const rightSrc = webcamRef.current.getScreenshot();
                    localImages.push(rightSrc);
                    setCapturedImages([...localImages]);
                    setScanPhase('analyzing');
                    if (isVoiceOn) speak("Captures complete. Processing full spatial analysis.");
                    else toast.success('Captures complete. Analyzing...');

                    executeBackendScan(localImages);
                }, 3500);
            }, 3500);
        }, 3000);
    };

    const executeBackendScan = async (imagesArray) => {
        setLoading(true);

        try {
            // Send to Vision Scan
            const response = await api.post("/ai/vision-scan", {
                images: imagesArray,
                isMultiAngle: true
            });

            if (response.data.success) {
                setResults(response.data.data);
                toast.success(response.data.data.isVirtual ? "Syncing Bio-Data for analysis..." : "360° Facial analysis complete!");
                setScanPhase('done');

                // Voice Output Logic
                if (isVoiceOn) {
                    const data = response.data.data;
                    const text = `Analysis complete. Your vitality score is ${data.vitalityScore} percent. ${data.summary} I recommend that you ${data.recommendation}.`;
                    speak(text);
                }
            }
        } catch (error) {
            console.error("Scan error:", error);
            toast.error("Scan failed. Please try again.");
            setScanPhase('idle');
        } finally {
            setLoading(false);
            setIsScanning(false);
        }
    };

    const speak = (text) => {
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        utter.pitch = 1.1;
        synth.speak(utter);
    };

    const reset = () => {
        setImgSrc(null);
        setCapturedImages([]);
        setScanPhase('idle');
        setResults(null);
        setIsScanning(false);
        setLoading(false);
    };

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <h1 className="gradient-text">AI Health Scanner</h1>
                <p>Advanced facial & micro-expression analysis for proactive health insights.</p>
            </header>

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
                {/* LEFT: CAMERA & SCANNER */}
                <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
                        {scanPhase === 'idle' || scanPhase === 'front' || scanPhase === 'left' || scanPhase === 'right' ? (
                            <>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                                    style={{ width: '100%', display: 'block' }}
                                />
                                {scanPhase !== 'idle' && (
                                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                                        <div style={{
                                            background: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(8px)',
                                            padding: '16px 40px',
                                            borderRadius: '50px',
                                            border: '1px solid rgba(0,212,255,0.4)',
                                            boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,212,255,0.2)',
                                            color: '#fff',
                                            textTransform: 'uppercase',
                                            letterSpacing: '2px',
                                            fontWeight: 700,
                                            fontSize: '1.4rem',
                                            animation: 'pulseGlow 2s infinite alternate',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transform: 'translateY(-120px)'
                                        }}>
                                            {scanPhase === 'front' && <><Camera size={24} color="var(--cyan)" /> <span>Align Face Forward</span></>}
                                            {scanPhase === 'left' && <><span style={{ color: 'var(--cyan)' }}>⬅</span> <span>Turn Head Left</span></>}
                                            {scanPhase === 'right' && <><span>Turn Head Right</span> <span style={{ color: 'var(--cyan)' }}>➡</span></>}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', position: 'relative' }}>
                                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.8)', color: 'var(--cyan)', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid rgba(0,212,255,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>SPATIAL DATA SECURED</span>
                                    {scanPhase === 'analyzing' && <span style={{ animation: 'pulse 1s infinite' }}>PROCESSING...</span>}
                                    {scanPhase === 'done' && <span style={{ color: 'var(--green)' }}>ANALYSIS COMPLETE</span>}
                                </div>
                                <div style={{ display: 'flex', flex: 1, padding: '10px', gap: '10px' }}>
                                    {capturedImages.map((src, i) => (
                                        <div key={i} style={{ flex: 1, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, padding: '4px 8px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', zIndex: 10, borderBottomRightRadius: '8px' }}>
                                                {['FRONT', 'LEFT', 'RIGHT'][i]}
                                            </div>
                                            <img src={src} alt={`angle-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: scanPhase === 'analyzing' ? 0.5 : 0.8, filter: scanPhase === 'analyzing' ? 'contrast(1.2) sepia(0.3) hue-rotate(180deg)' : 'none', transition: 'all 0.5s' }} />

                                            {scanPhase === 'analyzing' && (
                                                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)', animation: 'scanBox 1.5s linear infinite alternate' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* LASER SCAN ANIMATION (Linear) */}
                        {isScanning && (
                            <div className="scan-laser" style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                                background: 'var(--cyan)', boxShadow: '0 0 15px var(--cyan)',
                                zIndex: 10, animation: 'scanMove 2s infinite ease-in-out'
                            }} />
                        )}

                        {/* HIGH-TECH 360 radar OVERLAY */}
                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '320px', height: '320px', borderRadius: '50%', border: '2px solid rgba(0,212,255,0.15)', boxShadow: 'inset 0 0 40px rgba(0,212,255,0.1)' }}>
                                {/* Crosshairs */}
                                <div style={{ position: 'absolute', top: '50%', left: '-30px', right: '-30px', height: '1px', background: 'rgba(0,212,255,0.3)', transform: 'translateY(-50%)' }} />
                                <div style={{ position: 'absolute', left: '50%', top: '-30px', bottom: '-30px', width: '1px', background: 'rgba(0,212,255,0.3)', transform: 'translateX(-50%)' }} />

                                {/* Inner Target Rings */}
                                <div style={{ position: 'absolute', top: '15%', left: '15%', right: '15%', bottom: '15%', borderRadius: '50%', border: '1px dashed rgba(0,212,255,0.2)' }} />
                                <div style={{ position: 'absolute', top: '30%', left: '30%', right: '30%', bottom: '30%', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.1)' }} />

                                {/* 360 Radar Sweep (Always active for HUD effect) */}
                                <div className="radar-sweep" style={{
                                    position: 'absolute', inset: 0, borderRadius: '50%',
                                    background: 'conic-gradient(from 0deg, rgba(0,212,255,0) 60%, rgba(0,212,255,0.4) 100%)',
                                    animation: isScanning ? 'radarSpin 1s linear infinite' : 'radarSpin 4s linear infinite'
                                }} />

                                {/* Scanning Nodes (Always active, faster during scan) */}
                                <div className="scan-node" style={{ position: 'absolute', top: '22%', left: '35%', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', animation: isScanning ? 'pulseNode 0.5s infinite' : 'pulseNode 2s infinite' }} />
                                <div className="scan-node" style={{ position: 'absolute', top: '22%', right: '35%', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cyan)', animation: isScanning ? 'pulseNode 0.6s infinite 0.1s' : 'pulseNode 2.5s infinite 0.3s' }} />
                                <div className="scan-node" style={{ position: 'absolute', bottom: '30%', left: '48%', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', animation: isScanning ? 'pulseNode 0.4s infinite 0.2s' : 'pulseNode 1.5s infinite 0.7s' }} />
                                <div className="scan-node" style={{ position: 'absolute', top: '45%', right: '20%', width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: isScanning ? 'pulseNode 0.5s infinite 0.1s' : 'pulseNode 1.2s infinite 0.1s' }} />
                                <div className="scan-node" style={{ position: 'absolute', top: '45%', left: '20%', width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: isScanning ? 'pulseNode 0.5s infinite 0.2s' : 'pulseNode 1.2s infinite 0.5s' }} />

                                {/* Scanning overlay frame lines */}
                                <div style={{ position: 'absolute', top: '35%', left: '25%', right: '25%', height: '1px', background: 'rgba(0,212,255,0.6)', animation: isScanning ? 'scanBox 0.8s ease-in-out infinite alternate' : 'scanBox 3s ease-in-out infinite alternate' }} />
                                <div style={{ position: 'absolute', top: '60%', left: '25%', right: '25%', height: '1px', background: 'rgba(16,185,129,0.6)', animation: isScanning ? 'scanBox 1s ease-in-out infinite alternate-reverse' : 'scanBox 4s ease-in-out infinite alternate-reverse' }} />

                                {/* Corner Reticles */}
                                <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' }} />
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', borderTop: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' }} />
                                <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '20px', height: '20px', borderBottom: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' }} />
                                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '20px', height: '20px', borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        {scanPhase === 'idle' ? (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={start360Scan}>
                                <Camera size={18} /> Start 360° Spatial Scan
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-primary" style={{ flex: 1 }} disabled={true}>
                                    {scanPhase !== 'analyzing' && scanPhase !== 'done' ? 'Capturing Angles...' : 'Analyzing 360° Data...'}
                                </button>
                                <button className="btn btn-ghost" onClick={reset}>
                                    <RefreshCw size={18} />
                                </button>
                            </>
                        )}
                        <button
                            className={`btn ${isVoiceOn ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => setIsVoiceOn(!isVoiceOn)}
                            title={isVoiceOn ? 'Voice Assistant Enabled' : 'Voice Assistant Disabled'}
                        >
                            {isVoiceOn ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>
                    </div>

                    <style>{`
                        @keyframes scanMove {
                            0% { top: 0% }
                            50% { top: 100% }
                            100% { top: 0% }
                        }
                        @keyframes radarSpin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes pulseNode {
                            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,212,255,0.8); }
                            50% { transform: scale(1.8); box-shadow: 0 0 10px 5px rgba(0,212,255,0); }
                            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,212,255,0); }
                        }
                        @keyframes scanBox {
                            0% { transform: translateY(-20px) scaleX(0.8); opacity: 0.5; }
                            100% { transform: translateY(20px) scaleX(1.2); opacity: 1; }
                        }
                        @keyframes pulseGlow {
                            0% { box-shadow: 0 0 20px rgba(0,212,255,0.2), inset 0 0 10px rgba(0,212,255,0.1); transform: translateY(-120px) scale(0.98); }
                            100% { box-shadow: 0 0 40px rgba(0,212,255,0.6), inset 0 0 20px rgba(0,212,255,0.4); transform: translateY(-120px) scale(1.02); }
                        }
                    `}</style>
                </div>

                {/* RIGHT: RESULTS & INSIGHTS */}
                <div className="animate-fade-in-up">
                    {!results ? (
                        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
                            <Activity size={48} className="text-glow" style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                            <h3>Awaiting Scan</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Capture a photo to begin the AI Vision health analysis. Our models analyze micro-expressions,
                                skin tone markers, and facial symmetry for immediate wellness feedback.
                            </p>
                        </div>
                    ) : (
                        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Shield className="text-glow" style={{ color: 'var(--green)' }} />
                                <h3 style={{ margin: 0 }}>AI Health Insights</h3>
                                <div className="badge badge-green" style={{ marginLeft: 'auto' }}>Accuracy: High</div>
                            </div>

                            <div className="grid grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(16,185,129,0.05)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>VITITALITY SCORE</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)' }}>{results.vitalityScore}%</div>
                                </div>
                                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,212,255,0.05)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>STRESS LEVEL</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan)' }}>{results.stressLevel}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>OBSERVED MARKERS</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {results.markers?.map(m => (
                                        <div key={m} className="badge badge-purple" style={{ textTransform: 'none' }}>{m}</div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '16px', borderLeft: '3px solid var(--cyan)' }}>
                                <p style={{ fontSize: '0.95rem', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
                                    "{results.summary}"
                                </p>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem' }}>
                                    <Heart size={14} style={{ color: 'var(--red)', marginBottom: '4px' }} />
                                    <div style={{ fontWeight: 600 }}>Recommendation</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>{results.recommendation}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
