"use client";

import { motion } from "framer-motion";
import { Wrench, Camera, Mic, Sparkles, ArrowRight, Zap, Globe, Shield } from "lucide-react";
import Link from "next/link";

import PolygonBackground from "@/components/PolygonBackground";

export default function Home() {
  return (
    <>
      <PolygonBackground />

      <div className="min-h-screen flex flex-col relative z-10">
        {/* Navigation */}
        <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MechGuide</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/repair" className="glass-button px-6 py-2.5 text-sm font-medium flex items-center gap-2 group hover:bg-white/10">
                Launch Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 glass-button px-4 py-2 mb-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-full"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Powered by Gemini 3 Live API</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight text-white"
            >
              Your AI{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-glow">Repair Co-Pilot</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Point your camera at any machinery. Get real-time AR-guided
              diagnostics, step-by-step repair instructions, and voice coaching
              from the world&apos;s smartest repair assistant.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link
                href="/repair"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full font-semibold text-lg flex items-center gap-3 overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/50"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Camera className="w-5 h-5" />
                <span className="relative">Start Repair Session</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
              </Link>

              <Link href="/repair" className="glass-button px-8 py-4 font-semibold text-lg flex items-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all">
                <Mic className="w-5 h-5 text-gray-300" />
                <span className="text-gray-200">Try Voice Mode</span>
              </Link>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              <FeatureCard
                icon={<Camera className="w-6 h-6" />}
                title="Live AR Overlays"
                description="Real-time visual guidance overlaid on your camera feed. See exactly where to look and what to fix."
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Marathon Agent"
                description="Maintains context across hours of repair sessions. Remembers your skill level and past repairs."
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title="94 Languages"
                description="Voice guidance in your native language with technical terminology that makes sense."
              />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-500 border-t border-white/5 pt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">1.2B</div>
                <div className="text-xs uppercase tracking-wider">Potential Repairs Yearly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">80%</div>
                <div className="text-xs uppercase tracking-wider">DIY Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">$97B</div>
                <div className="text-xs uppercase tracking-wider">DIY Market Size</div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="glass border-t border-white/5 py-6 px-6 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Built for the Gemini 3 Hackathon 2026
          </div>
        </footer>
      </div>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-6 text-left cursor-pointer"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-4 text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
