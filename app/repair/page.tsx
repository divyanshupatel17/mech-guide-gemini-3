"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Settings, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import CameraFeed from "@/components/CameraFeed";
import ChatPanel from "@/components/ChatPanel";
import RepairSteps from "@/components/RepairSteps";
import { analyzeFrame, chatWithMechGuide, AnalysisResult, Detection, RepairStep } from "@/lib/gemini";

export default function RepairPage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [repairSteps, setRepairSteps] = useState<RepairStep[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [voiceGuidance, setVoiceGuidance] = useState<string>();
    const [diagnosis, setDiagnosis] = useState<AnalysisResult["diagnosis"] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastFrame, setLastFrame] = useState<string | null>(null);

    // Handle frame analysis
    const handleFrame = useCallback(async (imageData: string) => {
        if (isAnalyzing) return;

        setIsAnalyzing(true);
        setError(null);
        setLastFrame(imageData);

        try {
            const result = await analyzeFrame(imageData);
            setDetections(result.detections);
            setRepairSteps(result.repairSteps);
            setDiagnosis(result.diagnosis);
            setVoiceGuidance(result.voiceGuidance);
        } catch (err) {
            console.error("Analysis error:", err);
            setError("Failed to analyze. Check your API key in .env.local");
        } finally {
            setIsAnalyzing(false);
        }
    }, [isAnalyzing]);

    // Handle chat messages
    const handleSendMessage = useCallback(async (message: string): Promise<string> => {
        try {
            const response = await chatWithMechGuide(message, lastFrame || undefined);
            return response;
        } catch (err) {
            console.error("Chat error:", err);
            throw err;
        }
    }, [lastFrame]);

    // Handle step completion
    const handleStepComplete = useCallback((step: number) => {
        setCurrentStep(step + 1);
        if (repairSteps[step]) {
            setVoiceGuidance(`Step ${step} complete. ${repairSteps[step]?.instruction || "Great job!"}`);
        }
    }, [repairSteps]);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="glass fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b border-white/5">
                <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Exit</span>
                    </Link>

                    <div className="flex items-center gap-2 px-4 py-1.5 glass-button">
                        <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
                        <span className="font-semibold text-sm tracking-wide">Repair Session</span>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16 pb-4 px-4 h-full relative z-10">
                <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-4 h-full">
                    {/* Left Column - Camera (Mobile: 45vh, Desktop: 8 cols) */}
                    <div className="h-[45vh] lg:h-full lg:col-span-8 flex flex-col gap-4 min-h-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 relative rounded-2xl overflow-hidden glass-card shadow-2xl shadow-black/50"
                        >
                            <div className="absolute inset-0">
                                <CameraFeed
                                    onFrame={handleFrame}
                                    detections={detections}
                                    isAnalyzing={isAnalyzing}
                                />
                            </div>
                        </motion.div>

                        {/* Diagnosis Card */}
                        <AnimatePresence>
                            {diagnosis && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-3 lg:p-5 border-l-4 border-l-blue-500 absolute lg:static top-4 left-4 right-4 z-20 lg:z-auto"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-1 text-white flex items-center gap-2">
                                                Diagnosis <span className="text-xs text-gray-500 font-normal uppercase tracking-wider">AI Analysis</span>
                                            </h4>
                                            <p className="text-gray-300 leading-relaxed text-sm line-clamp-2 lg:line-clamp-none">{diagnosis.summary}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${diagnosis.severity === "critical" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                                diagnosis.severity === "high" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                                                    diagnosis.severity === "medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                                        "bg-green-500/20 text-green-400 border border-green-500/30"
                                                }`}>
                                                {diagnosis.severity}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <div className="w-16 bg-white/10 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-500 h-1.5 rounded-full"
                                                        style={{ width: `${diagnosis.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span>{Math.round(diagnosis.confidence * 100)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error Display */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="glass-card p-4 border-red-500/30 flex items-center gap-3 text-red-400 bg-red-500/5 absolute lg:static bottom-4 left-4 right-4 z-20 lg:z-auto"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-sm">System Alert</p>
                                        <p className="text-xs opacity-70">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column - Chat & Steps (Mobile: Remaining height, Desktop: 4 cols) */}
                    <div className="flex-1 lg:h-full lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 min-h-0"
                        >
                            <ChatPanel
                                onSendMessage={handleSendMessage}
                                voiceGuidance={voiceGuidance}
                                isProcessing={isAnalyzing}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="h-1/3 min-h-[150px] lg:min-h-[200px]"
                        >
                            <div className="h-full overflow-y-auto scrollbar-thin rounded-2xl">
                                <RepairSteps
                                    steps={repairSteps}
                                    currentStep={currentStep}
                                    onStepComplete={handleStepComplete}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
