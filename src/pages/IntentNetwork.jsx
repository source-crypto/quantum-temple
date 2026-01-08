import React from "react";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import IntentNodesGrid from "../components/intent/IntentNodesGrid";
import AbundanceManifestTracker from "../components/intent/AbundanceManifestTracker";
import SpiritualWritingIntegration from "../components/intent/SpiritualWritingIntegration";

export default function IntentNetwork() {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-300 bg-clip-text text-transparent">
                Intent Network
              </h1>
              <p className="text-purple-400/70">Twelve OC-aligned intent nodes • Abundance transparency • Spiritual writing linkage</p>
            </div>
          </div>
        </motion.div>

        <AbundanceManifestTracker />
        <IntentNodesGrid />
        <SpiritualWritingIntegration />
      </div>
    </div>
  );
}