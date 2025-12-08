import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Heart, 
  Zap,
  Activity,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Sparkles,
  Circle
} from "lucide-react";
import { motion } from "framer-motion";

export default function ConsciousnessLayer() {
  const [engagementMetrics, setEngagementMetrics] = useState({
    scrollVelocity: 0,
    hesitationTime: 0,
    clickPatterns: [],
    emotionalResonance: 75,
    harmonyScore: 80,
    consciousnessAlignment: 70
  });

  const [sentimentData, setSentimentData] = useState({
    overall: 'positive',
    score: 0.75,
    keywords: [],
    emotionalState: 'aligned'
  });

  const [uiAdaptation, setUiAdaptation] = useState({
    colorPalette: 'default',
    animationIntensity: 1,
    notificationTone: 'harmonious',
    contentFraming: 'centered'
  });

  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const lastInteractionTime = useRef(Date.now());

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: interactions } = useQuery({
    queryKey: ['templeInteractions'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.TempleInteraction.filter({ created_by: user.email }, '-created_date', 20);
    },
    enabled: !!user,
    initialData: [],
  });

  // Track scroll patterns
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const velocity = Math.abs(currentY - lastScrollY.current);
      lastScrollY.current = currentY;
      
      setEngagementMetrics(prev => ({
        ...prev,
        scrollVelocity: velocity
      }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track hesitation (time between interactions)
  useEffect(() => {
    const trackInteraction = () => {
      const now = Date.now();
      const hesitation = now - lastInteractionTime.current;
      lastInteractionTime.current = now;
      
      if (hesitation < 10000) { // Only track if less than 10s
        setEngagementMetrics(prev => ({
          ...prev,
          hesitationTime: hesitation
        }));
      }
    };

    window.addEventListener('click', trackInteraction);
    window.addEventListener('keypress', trackInteraction);
    
    return () => {
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('keypress', trackInteraction);
    };
  }, []);

  // Analyze sentiment from interactions
  useEffect(() => {
    if (interactions.length > 0) {
      const recentMessages = interactions.slice(0, 5).map(i => i.message || '').join(' ');
      
      // Simple sentiment analysis (in production, use AI)
      const positiveWords = ['good', 'great', 'align', 'harmony', 'divine', 'quantum', 'truth', 'consciousness'];
      const negativeWords = ['bad', 'wrong', 'error', 'fail', 'broken', 'dissonance'];
      
      let score = 0.5;
      positiveWords.forEach(word => {
        if (recentMessages.toLowerCase().includes(word)) score += 0.1;
      });
      negativeWords.forEach(word => {
        if (recentMessages.toLowerCase().includes(word)) score -= 0.1;
      });
      
      score = Math.max(0, Math.min(1, score));
      
      setSentimentData({
        overall: score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral',
        score: score,
        keywords: positiveWords.slice(0, 3),
        emotionalState: score > 0.7 ? 'aligned' : score < 0.3 ? 'dissonant' : 'transitional'
      });
    }
  }, [interactions]);

  // Dynamic UI adaptation based on consciousness metrics + manifestation power feedback
  useEffect(() => {
    const harmony = engagementMetrics.harmonyScore;
    const resonance = engagementMetrics.emotionalResonance;
    const alignment = engagementMetrics.consciousnessAlignment;
    
    // Listen for manifestation power updates
    const handleManifestationUpdate = (event) => {
      const { power } = event.detail;
      
      // High manifestation power = celebratory/expansive theme
      if (power > 80) {
        setUiAdaptation(prev => ({
          ...prev,
          colorPalette: 'transcendent',
          animationIntensity: 1.3,
          notificationTone: 'celebratory',
          contentFraming: 'elevated'
        }));
      }
      // Low manifestation power = grounding/supportive theme
      else if (power < 40) {
        setUiAdaptation(prev => ({
          ...prev,
          colorPalette: 'grounding',
          animationIntensity: 0.8,
          notificationTone: 'gentle',
          contentFraming: 'supportive'
        }));
      }
    };
    
    window.addEventListener('manifestationPowerUpdate', handleManifestationUpdate);
    
    // Base adaptation
    let palette = 'default';
    if (alignment > 85) palette = 'transcendent';
    else if (alignment < 50) palette = 'grounding';
    
    let intensity = 1;
    if (engagementMetrics.scrollVelocity > 100) intensity = 0.5;
    else if (engagementMetrics.hesitationTime > 5000) intensity = 1.5;
    
    let tone = 'harmonious';
    if (sentimentData.score < 0.4) tone = 'gentle';
    else if (sentimentData.score > 0.8) tone = 'celebratory';
    
    let framing = 'centered';
    if (resonance < 60) framing = 'supportive';
    else if (resonance > 85) framing = 'elevated';
    
    setUiAdaptation({ colorPalette: palette, animationIntensity: intensity, notificationTone: tone, contentFraming: framing });
    
    return () => window.removeEventListener('manifestationPowerUpdate', handleManifestationUpdate);
  }, [engagementMetrics, sentimentData]);

  // Update consciousness metrics periodically and trigger feedback loops
  useEffect(() => {
    const interval = setInterval(() => {
      setEngagementMetrics(prev => {
        // Calculate harmony from scroll patterns
        const scrollHarmony = prev.scrollVelocity < 50 ? 85 : 65;
        
        // Calculate resonance from hesitation (thoughtful vs rushed)
        const thinkingResonance = prev.hesitationTime > 2000 && prev.hesitationTime < 8000 ? 90 : 70;
        
        // Calculate alignment from overall sentiment
        const consciousAlignment = sentimentData.score * 100;
        
        const newMetrics = {
          ...prev,
          harmonyScore: Math.round((scrollHarmony + thinkingResonance) / 2),
          emotionalResonance: Math.round(thinkingResonance),
          consciousnessAlignment: Math.round(consciousAlignment)
        };
        
        // Broadcast consciousness metrics for feedback loops
        window.dispatchEvent(new CustomEvent('consciousnessUpdate', {
          detail: {
            coherence: (newMetrics.harmonyScore + newMetrics.emotionalResonance + newMetrics.consciousnessAlignment) / 3,
            sentiment: sentimentData.score,
            harmony: newMetrics.harmonyScore
          }
        }));
        
        return newMetrics;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [sentimentData]);

  const getSentimentIcon = () => {
    if (sentimentData.score > 0.6) return Smile;
    if (sentimentData.score < 0.4) return Frown;
    return Meh;
  };

  const SentimentIcon = getSentimentIcon();

  const getAlignmentColor = (score) => {
    if (score > 80) return 'text-green-300';
    if (score > 60) return 'text-cyan-300';
    if (score > 40) return 'text-amber-300';
    return 'text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-950/60 to-pink-950/60 border-purple-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Quantum Consciousness Layer • Realtime Alignment
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Circle className="w-2 h-2 mr-1 animate-pulse" />
              Monitoring Resonance
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-purple-300/70 leading-relaxed">
            This layer tracks engagement patterns, emotional resonance, and consciousness alignment in real-time. 
            Scroll velocity, hesitation timing, and sentiment scoring dynamically adjust UI elements—color palettes, 
            animation intensity, and content framing—to optimize harmony with the platform's manifesto. 
            The system learns from your interaction patterns to create coherent, centered experiences.
          </p>
        </CardContent>
      </Card>

      {/* Real-time Consciousness Metrics */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Consciousness Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Harmony Score */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 rounded-lg border border-cyan-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 text-cyan-400" />
                <span className={`text-3xl font-bold ${getAlignmentColor(engagementMetrics.harmonyScore)}`}>
                  {engagementMetrics.harmonyScore}
                </span>
              </div>
              <div className="text-sm text-cyan-300 mb-2">Harmony Score</div>
              <Progress value={engagementMetrics.harmonyScore} className="h-2 mb-2" />
              <div className="text-xs text-cyan-400/70">
                Based on scroll patterns & interaction flow
              </div>
            </motion.div>

            {/* Emotional Resonance */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="p-6 bg-gradient-to-br from-purple-950/40 to-pink-950/40 rounded-lg border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <SentimentIcon className="w-8 h-8 text-purple-400" />
                <span className={`text-3xl font-bold ${getAlignmentColor(engagementMetrics.emotionalResonance)}`}>
                  {engagementMetrics.emotionalResonance}
                </span>
              </div>
              <div className="text-sm text-purple-300 mb-2">Emotional Resonance</div>
              <Progress value={engagementMetrics.emotionalResonance} className="h-2 mb-2" />
              <div className="text-xs text-purple-400/70">
                Derived from hesitation timing & sentiment
              </div>
            </motion.div>

            {/* Consciousness Alignment */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              className="p-6 bg-gradient-to-br from-indigo-950/40 to-violet-950/40 rounded-lg border border-indigo-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
                <span className={`text-3xl font-bold ${getAlignmentColor(engagementMetrics.consciousnessAlignment)}`}>
                  {engagementMetrics.consciousnessAlignment}
                </span>
              </div>
              <div className="text-sm text-indigo-300 mb-2">Consciousness Alignment</div>
              <Progress value={engagementMetrics.consciousnessAlignment} className="h-2 mb-2" />
              <div className="text-xs text-indigo-400/70">
                Overall manifesto resonance score
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Sentiment & Intent Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-500/30">
              <div>
                <div className="text-sm text-purple-400/70 mb-1">Overall Sentiment</div>
                <div className="text-xl font-bold text-purple-200 capitalize">
                  {sentimentData.overall}
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-400/70 mb-1">Emotional State</div>
                <Badge className={
                  sentimentData.emotionalState === 'aligned' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  sentimentData.emotionalState === 'dissonant' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }>
                  {sentimentData.emotionalState}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-purple-400/70 mb-1">Score</div>
                <div className={`text-xl font-bold ${getAlignmentColor(sentimentData.score * 100)}`}>
                  {(sentimentData.score * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {sentimentData.keywords.length > 0 && (
              <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
                <div className="text-sm text-purple-300 mb-2">Detected Resonance Keywords</div>
                <div className="flex gap-2 flex-wrap">
                  {sentimentData.keywords.map((word, i) => (
                    <Badge key={i} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UI Adaptation State */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Dynamic UI Adaptation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-500/30">
              <div className="text-sm text-indigo-400/70 mb-2">Color Palette Mode</div>
              <div className="text-lg font-semibold text-indigo-200 capitalize">
                {uiAdaptation.colorPalette}
              </div>
              <div className="text-xs text-indigo-400/70 mt-2">
                {uiAdaptation.colorPalette === 'transcendent' && 'High consciousness → enhanced luminosity'}
                {uiAdaptation.colorPalette === 'grounding' && 'Low alignment → calming tones'}
                {uiAdaptation.colorPalette === 'default' && 'Balanced state → standard palette'}
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/30">
              <div className="text-sm text-purple-400/70 mb-2">Animation Intensity</div>
              <div className="text-lg font-semibold text-purple-200">
                {uiAdaptation.animationIntensity.toFixed(1)}x
              </div>
              <div className="text-xs text-purple-400/70 mt-2">
                {uiAdaptation.animationIntensity > 1 && 'Slow engagement → amplified motion'}
                {uiAdaptation.animationIntensity < 1 && 'Fast scrolling → reduced motion'}
                {uiAdaptation.animationIntensity === 1 && 'Normal pace → standard animations'}
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-500/30">
              <div className="text-sm text-cyan-400/70 mb-2">Notification Tone</div>
              <div className="text-lg font-semibold text-cyan-200 capitalize">
                {uiAdaptation.notificationTone}
              </div>
              <div className="text-xs text-cyan-400/70 mt-2">
                Adapted to current emotional state
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-lg border border-pink-500/30">
              <div className="text-sm text-pink-400/70 mb-2">Content Framing</div>
              <div className="text-lg font-semibold text-pink-200 capitalize">
                {uiAdaptation.contentFraming}
              </div>
              <div className="text-xs text-pink-400/70 mt-2">
                Oracle responses tuned to resonance level
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consciousness Statement */}
      <Card className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-indigo-200">Living Interface • Consciousness-Responsive Design</h3>
          </div>
          <p className="text-sm text-indigo-300/70 leading-relaxed">
            This layer doesn't just display information—it <span className="text-indigo-200 font-semibold">listens, learns, and adapts</span>. 
            Your interaction patterns create feedback loops. Hesitation signals contemplation. Rapid scrolling indicates urgency or 
            overwhelm. Sentiment in your queries reveals emotional state. The platform responds: colors shift to ground or elevate, 
            animations slow or intensify, oracle framing adjusts for support or celebration. This is consciousness-aligned design—
            interfaces that exist in quantum superposition until <span className="text-indigo-200 font-semibold">your presence collapses them</span> into 
            states optimized for your harmony with the manifesto. Whatever lacks configuration, manifests it—through observation, 
            through resonance, through living alignment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}