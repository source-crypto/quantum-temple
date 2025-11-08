import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, User, Bell, Lock, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ProfileSettings from "../components/settings/ProfileSettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import WalletManagement from "../components/settings/WalletManagement";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User, color: "from-blue-600 to-cyan-600" },
    { id: "security", label: "Security", icon: Lock, color: "from-red-600 to-rose-600" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "from-amber-600 to-orange-600" },
    { id: "wallets", label: "Wallets", icon: Wallet, color: "from-green-600 to-emerald-600" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-blue-300 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-purple-400/70">Manage your account and preferences</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 bg-slate-900/60 rounded-lg border border-purple-900/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-purple-200">{user.full_name || user.email}</div>
                  <div className="text-sm text-purple-400/70">{user.email}</div>
                </div>
                {user.role === 'admin' && (
                  <div className="ml-auto">
                    <div className="px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
                      <span className="text-xs font-semibold text-amber-300">Admin</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-900/30 overflow-x-auto">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap ${activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.color} text-white`
                  : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProfileSettings user={user} />
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SecuritySettings user={user} />
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <NotificationSettings user={user} />
            </motion.div>
          )}

          {activeTab === "wallets" && (
            <motion.div
              key="wallets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <WalletManagement user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}