import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

const VoiceWave = ({ isListening, audioStream }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyserRef = useRef(null);
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        if (!isListening || !audioStream || !canvasRef.current) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Low detail for bars
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            // Calculate Volume for central pulse
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const avg = sum / bufferLength;
            setVolume(avg);

            // Draw Bars
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Circular visualizer
            const radius = 30 + (avg / 5);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#E63946'; // Red for recording
            ctx.fill();
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContext) audioContext.close();
        };
    }, [isListening, audioStream]);

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            {isListening ? (
                <canvas ref={canvasRef} width="100" height="100" className="w-full h-full" />
            ) : (
                <div className="p-4 bg-slate-100 rounded-full">
                    <Mic className="w-6 h-6 text-slate-400" />
                </div>
            )}

            {isListening && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Mic className="w-6 h-6 text-white z-10" />
                </div>
            )}
        </div>
    );
};

export default VoiceWave;
