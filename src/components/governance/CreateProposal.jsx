import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { addDays } from "date-fns";

export default function CreateProposal({ votingPower }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposalType, setProposalType] = useState("new_feature");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [requestedCurrency, setRequestedCurrency] = useState("QTC");
  const [votingDuration, setVotingDuration] = useState("7");
  
  const queryClient = useQueryClient();

  const createProposalMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      const proposalId = `PROP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const now = new Date();
      const votingStart = now;
      const votingEnd = addDays(now, parseInt(data.votingDuration));

      return base44.entities.Proposal.create({
        proposal_id: proposalId,
        title: data.title,
        description: data.description,
        proposal_type: data.proposalType,
        proposer_email: user.email,
        status: "active",
        voting_start_date: votingStart.toISOString(),
        voting_end_date: votingEnd.toISOString(),
        total_votes_for: 0,
        total_votes_against: 0,
        total_votes_abstain: 0,
        quorum_required: 1000000,
        approval_threshold: 0.66,
        requested_amount: parseFloat(data.requestedAmount) || 0,
        requested_currency: data.requestedCurrency,
        implementation_details: ""
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setTitle("");
      setDescription("");
      setRequestedAmount("");
      toast.success("Proposal created!", {
        description: "Your proposal is now live for voting"
      });
    },
    onError: () => {
      toast.error("Failed to create proposal");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (votingPower < 100) {
      toast.error("You need at least 100 QTC to create a proposal");
      return;
    }

    createProposalMutation.mutate({
      title,
      description,
      proposalType,
      requestedAmount,
      requestedCurrency,
      votingDuration
    });
  };

  const proposalTypes = [
    { value: "fee_adjustment", label: "Fee Adjustment", desc: "Modify transaction, swap, or bridge fees" },
    { value: "new_feature", label: "New Feature", desc: "Propose new functionality" },
    { value: "treasury_allocation", label: "Treasury Allocation", desc: "Request funds from treasury" },
    { value: "governance_change", label: "Governance Change", desc: "Modify governance parameters" },
    { value: "monetary_policy", label: "Monetary Policy", desc: "Adjust economic parameters" },
    { value: "international_integration", label: "International Integration", desc: "IMF/BIS system integration" }
  ];

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <FileText className="w-5 h-5" />
          Create New Proposal
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-200 mb-1">Proposal Requirements</h4>
                <ul className="text-sm text-indigo-300/70 space-y-1">
                  <li>• Minimum 100 QTC required to create proposal</li>
                  <li>• Default quorum: 1,000,000 QTC</li>
                  <li>• Default approval threshold: 66%</li>
                  <li>• Voting period: 1-30 days</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-purple-300">Proposal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, concise title..."
              className="bg-slate-950/50 border-purple-900/30 text-purple-100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-purple-300">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your proposal..."
              className="bg-slate-950/50 border-purple-900/30 text-purple-100 min-h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-purple-300">Proposal Type *</Label>
            <Select value={proposalType} onValueChange={setProposalType}>
              <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {proposalTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs text-purple-400/70">{type.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {proposalType === "treasury_allocation" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-purple-300">Requested Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-950/50 border-purple-900/30 text-purple-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-purple-300">Currency</Label>
                <Select value={requestedCurrency} onValueChange={setRequestedCurrency}>
                  <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QTC">QTC</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-purple-300">Voting Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              value={votingDuration}
              onChange={(e) => setVotingDuration(e.target.value)}
              className="bg-slate-950/50 border-purple-900/30 text-purple-100"
            />
          </div>

          <Button
            type="submit"
            disabled={createProposalMutation.isPending || votingPower < 100}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-semibold py-6"
          >
            {createProposalMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Proposal...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Create Proposal
              </>
            )}
          </Button>

          {votingPower < 100 && (
            <div className="text-sm text-amber-400/70 text-center p-3 bg-amber-950/30 rounded-lg border border-amber-500/30">
              You need at least 100 QTC to create proposals. Current balance: {votingPower.toLocaleString()} QTC
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}