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

    const [activeTab, setActiveTab] = useState<"chat" | "steps">("chat");

    // ... (keep existing effects)

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden bg-black text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b border-white/5 bg-black/50 backdrop-blur-md">
                <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Exit</span>
                    </Link>

                    <div className="flex items-center gap-2 px-4 py-1.5 glass-button">
                        <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
                        <span className="font-semibold text-sm tracking-wide hidden md:inline">Repair Session</span>
                        <span className="font-semibold text-sm tracking-wide md:hidden">Repair</span>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16 pb-0 px-0 md:px-4 md:pb-4 h-full relative z-10">
                <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:gap-4 h-full">

                    {/* Left Column - Camera */}
                    {/* Mobile: Top Section (40%) | Desktop: Left Col (Full Height) */}
                    <div className="h-[40vh] lg:h-full lg:col-span-8 flex flex-col min-h-0 relative">
                        <div className="absolute inset-0 md:relative md:rounded-2xl overflow-hidden glass-card shadow-2xl shadow-black/50 mx-0 md:mx-0">
                            <CameraFeed
                                onFrame={handleFrame}
                                detections={detections}
                                isAnalyzing={isAnalyzing}
                            />
                        </div>

                        {/* Mobile-Only Overlay Diagnosis (Compact) */}
                        <AnimatePresence>
                            {diagnosis && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-4 left-4 right-4 z-20 md:hidden"
                                >
                                    <div className="glass-card p-3 border-l-4 border-l-blue-500 bg-black/80 backdrop-blur-xl">
                                        <p className="text-white text-sm font-medium line-clamp-2">{diagnosis.summary}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Desktop Diagnosis Card (Below Camera or Overlay) - Hidden on Mobile to save space */}
                        <div className="hidden lg:block absolute bottom-4 left-4 right-4 z-20">
                            <AnimatePresence>
                                {diagnosis && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-card p-4 border-l-4 border-l-blue-500"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-semibold mb-1 text-white">Diagnosis</h4>
                                                <p className="text-gray-300 text-sm">{diagnosis.summary}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${diagnosis.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                                                }`}>
                                                {diagnosis.severity}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column / Bottom Section */}
                    {/* Mobile: Tabs + Content (Flex-1) | Desktop: Sidebar (Full Height) */}
                    <div className="flex-1 lg:h-full lg:col-span-4 flex flex-col min-h-0 bg-black/40 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-0 rounded-t-3xl lg:rounded-none border-t border-white/10 lg:border-t-0 -mt-4 lg:mt-0 pt-4 lg:pt-0 relative z-20">

                        {/* Mobile Tab Switcher */}
                        <div className="flex items-center justify-center p-1 mx-6 mb-2 bg-white/5 rounded-xl border border-white/10 lg:hidden">
                            <button
                                onClick={() => setActiveTab("chat")}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "chat" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                AI Assistant
                            </button>
                            <button
                                onClick={() => setActiveTab("steps")}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "steps" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Repair Steps
                            </button>
                        </div>

                        {/* Desktop: Show Both | Mobile: Show Active Tab */}
                        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden px-4 md:px-0 pb-4 md:pb-0">
                            {/* Chat Panel */}
                            <div className={`${activeTab === "chat" ? "flex" : "hidden"} lg:flex flex-1 min-h-0 flex-col`}>
                                <div className="flex-1 relative rounded-2xl overflow-hidden glass-card">
                                    <ChatPanel
                                        onSendMessage={handleSendMessage}
                                        voiceGuidance={voiceGuidance}
                                        isProcessing={isAnalyzing}
                                    />
                                </div>
                            </div>

                            {/* Repair Steps */}
                            <div className={`${activeTab === "steps" ? "flex" : "hidden"} lg:flex lg:h-1/3 min-h-0 flex-col`}>
                                <div className="h-full relative rounded-2xl overflow-hidden glass-card flex flex-col">
                                    <div className="flex-1 overflow-y-auto scrollbar-thin p-1">
                                        <RepairSteps
                                            steps={repairSteps}
                                            currentStep={currentStep}
                                            onStepComplete={handleStepComplete}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
