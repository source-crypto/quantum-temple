import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";

export default function NotificationSettings({ user }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalNotifications, setProposalNotifications] = useState(true);
  const [transactionNotifications, setTransactionNotifications] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(false);
  const [rewardNotifications, setRewardNotifications] = useState(true);

  const handleToggle = (setting, value) => {
    toast.success(`${setting} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <Card className="bg-slate-900/60 border-amber-900/40">
      <CardHeader className="border-b border-amber-900/30">
        <CardTitle className="flex items-center gap-2 text-amber-200">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <Label htmlFor="email-notifications" className="text-purple-200 cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-xs text-purple-400/70">Receive updates via email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={(checked) => {
                setEmailNotifications(checked);
                handleToggle('Email notifications', checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <div>
                <Label htmlFor="proposal-notifications" className="text-purple-200 cursor-pointer">
                  Governance Proposals
                </Label>
                <p className="text-xs text-purple-400/70">Alerts for new proposals and voting</p>
              </div>
            </div>
            <Switch
              id="proposal-notifications"
              checked={proposalNotifications}
              onCheckedChange={(checked) => {
                setProposalNotifications(checked);
                handleToggle('Proposal notifications', checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <Label htmlFor="transaction-notifications" className="text-purple-200 cursor-pointer">
                  Transaction Alerts
                </Label>
                <p className="text-xs text-purple-400/70">Notify on currency transfers and swaps</p>
              </div>
            </div>
            <Switch
              id="transaction-notifications"
              checked={transactionNotifications}
              onCheckedChange={(checked) => {
                setTransactionNotifications(checked);
                handleToggle('Transaction alerts', checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <div>
                <Label htmlFor="market-alerts" className="text-purple-200 cursor-pointer">
                  Market Insights
                </Label>
                <p className="text-xs text-purple-400/70">AI predictions and price alerts</p>
              </div>
            </div>
            <Switch
              id="market-alerts"
              checked={marketAlerts}
              onCheckedChange={(checked) => {
                setMarketAlerts(checked);
                handleToggle('Market alerts', checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <Label htmlFor="reward-notifications" className="text-purple-200 cursor-pointer">
                  Staking Rewards
                </Label>
                <p className="text-xs text-purple-400/70">Alerts for claimable rewards</p>
              </div>
            </div>
            <Switch
              id="reward-notifications"
              checked={rewardNotifications}
              onCheckedChange={(checked) => {
                setRewardNotifications(checked);
                handleToggle('Reward notifications', checked);
              }}
            />
          </div>
        </div>

        <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
          <p className="text-sm text-indigo-300/70">
            Notification preferences are saved automatically. You can always change these settings later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}