
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Sparkles, 
  Shield, 
  Scroll, 
  Coins, 
  MessageCircle, 
  Database,
  Hexagon,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Temple Home",
    url: createPageUrl("Home"),
    icon: Sparkles,
  },
  {
    title: "Attestation",
    url: createPageUrl("Attestation"),
    icon: Shield,
  },
  {
    title: "Ceremonial",
    url: createPageUrl("Ceremonial"),
    icon: Scroll,
  },
  {
    title: "Divine Currency",
    url: createPageUrl("Currency"),
    icon: Coins,
  },
  {
    title: "Governance",
    url: createPageUrl("Governance"),
    icon: Database,
  },
  {
    title: "DEX",
    url: createPageUrl("DEX"),
    icon: Hexagon,
  },
  {
    title: "Security",
    url: createPageUrl("Security"),
    icon: Shield,
  },
  {
    title: "Interactions",
    url: createPageUrl("Interactions"),
    icon: MessageCircle,
  },
  {
    title: "Registry",
    url: createPageUrl("Registry"),
    icon: Database,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --quantum-purple: #9333ea;
          --quantum-blue: #3b82f6;
          --quantum-gold: #f59e0b;
          --divine-glow: #a855f7;
        }
        
        body {
          background: linear-gradient(135deg, #0f0a1f 0%, #1a0b2e 50%, #16213e 100%);
        }
        
        .quantum-glow {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
        
        .sacred-pattern {
          background-image: 
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(168, 85, 247, 0.03) 10px, rgba(168, 85, 247, 0.03) 20px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(147, 51, 234, 0.03) 10px, rgba(147, 51, 234, 0.03) 20px);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-purple-900/30 bg-slate-950/90 backdrop-blur-sm">
          <SidebarHeader className="border-b border-purple-900/30 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 rounded-lg flex items-center justify-center quantum-glow">
                  <Hexagon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
                  Quantum Temple
                </h2>
                <p className="text-xs text-purple-400/70">Veiled Consciousness</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3 sacred-pattern">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-purple-400/60 uppercase tracking-wider px-3 py-2">
                Sacred Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-purple-900/30 hover:text-purple-300 transition-all duration-300 rounded-lg mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-purple-900/40 text-purple-200 quantum-glow border border-purple-500/30' 
                            : 'text-purple-400/70'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-xs font-medium text-purple-400/60 uppercase tracking-wider px-3 py-2">
                Canonical Identity
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-3 space-y-2 bg-purple-950/30 rounded-lg border border-purple-900/30">
                  <div className="text-xs text-purple-300/80">
                    <div className="font-semibold mb-1">Timestamp:</div>
                    <div className="text-purple-400/60 font-mono text-[10px]">
                      Aug 27, 2002 • 10:37 PM
                    </div>
                  </div>
                  <div className="text-xs text-purple-300/80">
                    <div className="font-semibold mb-1">Location:</div>
                    <div className="text-purple-400/60">Buffalo, NY</div>
                  </div>
                  <div className="text-xs text-purple-300/80 mt-3 pt-3 border-t border-purple-900/30">
                    <div className="font-semibold mb-1">Status:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400/80">Veiled & Active</span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-purple-900/30 p-4">
            <div className="text-center text-xs text-purple-400/50 italic">
              "By God's Will Only"
              <div className="mt-1 text-[10px] text-purple-500/40">
                Singularity • Veiled • Eternal
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="bg-slate-950/50 backdrop-blur-sm border-b border-purple-900/20 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-purple-900/30 p-2 rounded-lg transition-colors duration-200 text-purple-300" />
              <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent">
                Quantum Temple
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
