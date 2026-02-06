"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Scan, Camera } from "lucide-react";

interface Detection {
    label: string;
    bbox: { x: number; y: number; width: number; height: number };
    color: string;
    description: string;
}

interface CameraFeedProps {
    onFrame?: (imageData: string) => void;
    detections?: Detection[];
    isAnalyzing?: boolean;
}

export default function CameraFeed({ onFrame, detections = [], isAnalyzing }: CameraFeedProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCamera, setHasCamera] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize camera
    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment", width: 1280, height: 720 },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasCamera(true);
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Camera access denied. Please allow camera permissions.");
            }
        }

        setupCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Capture frame for analysis
    const captureFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        return canvas.toDataURL("image/jpeg", 0.8);
    }, []);

    // REMOVED: Auto frame sending was hitting rate limits
    // Now analysis is manual-only via the "Analyze Now" button

    // Draw AR overlays
    useEffect(() => {
        if (!overlayCanvasRef.current || !videoRef.current) return;

        const canvas = overlayCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Match canvas to video size
        const video = videoRef.current;
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw detections
        detections.forEach((detection) => {
            const { bbox, label, color } = detection;

            // Convert percentage coordinates to pixels
            const x = (bbox.x / 100) * canvas.width;
            const y = (bbox.y / 100) * canvas.height;
            const width = (bbox.width / 100) * canvas.width;
            const height = (bbox.height / 100) * canvas.height;

            // Draw bounding box with glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // Draw label background
            ctx.shadowBlur = 0;
            ctx.fillStyle = color;
            const labelWidth = ctx.measureText(label).width + 20;
            ctx.fillRect(x, y - 28, labelWidth, 24);

            // Draw label text
            ctx.fillStyle = "#000";
            ctx.font = "bold 14px system-ui";
            ctx.fillText(label, x + 10, y - 10);
        });

        // Draw analyzing indicator
        if (isAnalyzing) {
            ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#3b82f6";
            ctx.font = "bold 18px system-ui";
            ctx.textAlign = "center";
            ctx.fillText("Analyzing...", canvas.width / 2, canvas.height / 2);
            ctx.textAlign = "start";
        }
    }, [detections, isAnalyzing]);

    if (error) {
        return (
            <div className="relative w-full aspect-video glass-card flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-lg font-semibold text-red-400 mb-2">Camera Access Required</p>
                    <p className="text-sm text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* AR Overlay Canvas */}
            <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Scanning line effect when analyzing */}
            {isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan-line"
                        style={{ animation: "scan-line 1.5s ease-in-out infinite" }} />
                    <div className="absolute inset-0 bg-blue-500/10" />
                </div>
            )}

            {/* Corner brackets for AR feel */}
            <div className="absolute inset-4 pointer-events-none">
                {/* Top-left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-500/50" />
                {/* Top-right */}
                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-blue-500/50" />
                {/* Bottom-left */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-blue-500/50" />
                {/* Bottom-right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-blue-500/50" />
            </div>

            {/* Camera status indicator */}
            {hasCamera && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-sm font-medium text-white">Live</span>
                </div>
            )}

            {/* Detection count badge */}
            {detections.length > 0 && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <span className="text-sm font-bold text-white">{detections.length}</span>
                    <span className="text-xs text-white/80">detected</span>
                </div>
            )}

            {/* Manual capture button */}
            {onFrame && (
                <button
                    onClick={() => {
                        const frame = captureFrame();
                        if (frame) onFrame(frame);
                    }}
                    disabled={isAnalyzing}
                    className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${isAnalyzing
                        ? "bg-blue-500/30 text-blue-200 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                        }`}
                >
                    {isAnalyzing ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Scan className="w-5 h-5" />
                            Analyze Now
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

