"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, AlertTriangle, Wrench } from "lucide-react";

interface RepairStep {
    step: number;
    instruction: string;
    warning?: string;
    tools?: string[];
}

interface RepairStepsProps {
    steps: RepairStep[];
    currentStep?: number;
    onStepComplete?: (step: number) => void;
}

export default function RepairSteps({ steps, currentStep = 1, onStepComplete }: RepairStepsProps) {
    if (steps.length === 0) {
        return (
            <div className="glass-card p-6 text-center text-gray-400">
                <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No repair steps yet.</p>
                <p className="text-sm opacity-70">Point camera at machinery to get started.</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-4 space-y-3">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Repair Steps
            </h3>

            {steps.map((step, index) => {
                const isCompleted = step.step < currentStep;
                const isCurrent = step.step === currentStep;

                return (
                    <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl transition-colors ${isCurrent
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30"
                            : isCompleted
                                ? "bg-green-500/10 border border-green-500/20"
                                : "bg-white/5 border border-white/10"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => onStepComplete?.(step.step)}
                                className="mt-0.5 flex-shrink-0"
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                ) : isCurrent ? (
                                    <Circle className="w-6 h-6 text-blue-400 animate-pulse" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-500" />
                                )}
                            </button>

                            <div className="flex-1">
                                <p className={`font-medium ${isCompleted ? "line-through opacity-60" : ""}`}>
                                    Step {step.step}: {step.instruction}
                                </p>

                                {step.warning && (
                                    <div className="mt-2 flex items-start gap-2 text-yellow-400 text-sm">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{step.warning}</span>
                                    </div>
                                )}

                                {step.tools && step.tools.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {step.tools.map((tool, i) => (
                                            <span
                                                key={i}
                                                className="text-xs px-2 py-1 bg-white/10 rounded-full flex items-center gap-1"
                                            >
                                                <Wrench className="w-3 h-3" /> {tool}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
