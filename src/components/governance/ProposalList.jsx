import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, TrendingUp, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, isPast, isFuture } from "date-fns";

export default function ProposalList({ votingPower }) {
  const queryClient = useQueryClient();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => base44.entities.Proposal.list('-created_date', 50),
    initialData: [],
  });

  const { data: userVotes } = useQuery({
    queryKey: ['userVotes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Vote.filter({ voter_email: user.email });
    },
    initialData: [],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, choice }) => {
      const user = await base44.auth.me();
      
      // Check if already voted
      const existingVote = userVotes.find(v => v.proposal_id === proposalId);
      if (existingVote) {
        throw new Error("You have already voted on this proposal");
      }

      // Create vote
      const vote = await base44.entities.Vote.create({
        proposal_id: proposalId,
        voter_email: user.email,
        vote_choice: choice,
        voting_power: votingPower,
        vote_timestamp: new Date().toISOString(),
        vote_signature: btoa(`${proposalId}-${user.email}-${choice}-${Date.now()}`).substring(0, 64)
      });

      // Update proposal vote counts
      const proposal = proposals.find(p => p.proposal_id === proposalId);
      const updates = {};
      
      if (choice === "for") {
        updates.total_votes_for = (proposal.total_votes_for || 0) + votingPower;
      } else if (choice === "against") {
        updates.total_votes_against = (proposal.total_votes_against || 0) + votingPower;
      } else {
        updates.total_votes_abstain = (proposal.total_votes_abstain || 0) + votingPower;
      }

      await base44.entities.Proposal.update(proposal.id, updates);

      return vote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
      toast.success("Vote recorded!", {
        description: "Your vote has been counted"
      });
    },
    onError: (error) => {
      toast.error("Vote failed", {
        description: error.message
      });
    }
  });

  const hasVoted = (proposalId) => {
    return userVotes.some(v => v.proposal_id === proposalId);
  };

  const calculateVotePercentage = (proposal) => {
    const total = (proposal.total_votes_for || 0) + (proposal.total_votes_against || 0) + (proposal.total_votes_abstain || 0);
    if (total === 0) return { for: 0, against: 0, abstain: 0 };
    
    return {
      for: ((proposal.total_votes_for || 0) / total) * 100,
      against: ((proposal.total_votes_against || 0) / total) * 100,
      abstain: ((proposal.total_votes_abstain || 0) / total) * 100
    };
  };

  const getProposalStatus = (proposal) => {
    const now = new Date();
    const votingStart = new Date(proposal.voting_start_date);
    const votingEnd = new Date(proposal.voting_end_date);

    if (isPast(votingEnd)) {
      const totalVotes = (proposal.total_votes_for || 0) + (proposal.total_votes_against || 0) + (proposal.total_votes_abstain || 0);
      const quorumMet = totalVotes >= proposal.quorum_required;
      const approvalMet = (proposal.total_votes_for || 0) / (totalVotes || 1) >= proposal.approval_threshold;
      
      if (proposal.status === "executed") return "executed";
      if (quorumMet && approvalMet) return "passed";
      return "rejected";
    }

    if (isFuture(votingStart)) return "pending";
    return "active";
  };

  const statusConfig = {
    pending: { color: "text-gray-400", bg: "bg-gray-500/20", border: "border-gray-500/30", icon: Clock },
    active: { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", icon: TrendingUp },
    passed: { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", icon: CheckCircle },
    rejected: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", icon: XCircle },
    executed: { color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", icon: CheckCircle }
  };

  const proposalTypeColors = {
    fee_adjustment: "border-blue-500/30 text-blue-300",
    new_feature: "border-purple-500/30 text-purple-300",
    treasury_allocation: "border-amber-500/30 text-amber-300",
    governance_change: "border-red-500/30 text-red-300",
    monetary_policy: "border-green-500/30 text-green-300",
    international_integration: "border-cyan-500/30 text-cyan-300"
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="bg-slate-900/60 border-purple-900/30 animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-purple-900/20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
          <p className="text-purple-400/60 mb-2">No proposals yet</p>
          <p className="text-sm text-purple-500/50">Be the first to create a proposal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal, index) => {
        const status = getProposalStatus(proposal);
        const statusInfo = statusConfig[status];
        const StatusIcon = statusInfo.icon;
        const votePercentages = calculateVotePercentage(proposal);
        const userHasVoted = hasVoted(proposal.proposal_id);
        const canVote = status === "active" && !userHasVoted && votingPower > 0;

        return (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/30 hover:border-purple-500/50 transition-all">
              <CardHeader className="border-b border-purple-900/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`${proposalTypeColors[proposal.proposal_type]} capitalize`}>
                        {proposal.proposal_type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={`${statusInfo.bg} ${statusInfo.border} ${statusInfo.color} capitalize`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status}
                      </Badge>
                    </div>
                    <CardTitle className="text-purple-200 mb-2">{proposal.title}</CardTitle>
                    <p className="text-sm text-purple-400/70">{proposal.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Vote Progress */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-green-400">For ({votePercentages.for.toFixed(1)}%)</span>
                      <span className="text-green-300 font-semibold">{(proposal.total_votes_for || 0).toLocaleString()} QTC</span>
                    </div>
                    <Progress value={votePercentages.for} className="h-2 bg-slate-950" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-red-400">Against ({votePercentages.against.toFixed(1)}%)</span>
                      <span className="text-red-300 font-semibold">{(proposal.total_votes_against || 0).toLocaleString()} QTC</span>
                    </div>
                    <Progress value={votePercentages.against} className="h-2 bg-slate-950" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Abstain ({votePercentages.abstain.toFixed(1)}%)</span>
                      <span className="text-gray-300 font-semibold">{(proposal.total_votes_abstain || 0).toLocaleString()} QTC</span>
                    </div>
                    <Progress value={votePercentages.abstain} className="h-2 bg-slate-950" />
                  </div>
                </div>

                {/* Proposal Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1">Quorum</div>
                    <div className="text-sm font-semibold text-purple-300">
                      {proposal.quorum_required.toLocaleString()} QTC
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1">Threshold</div>
                    <div className="text-sm font-semibold text-purple-300">
                      {(proposal.approval_threshold * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Start
                    </div>
                    <div className="text-xs text-purple-300">
                      {format(new Date(proposal.voting_start_date), "MMM d, HH:mm")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      End
                    </div>
                    <div className="text-xs text-purple-300">
                      {format(new Date(proposal.voting_end_date), "MMM d, HH:mm")}
                    </div>
                  </div>
                </div>

                {/* Voting Buttons */}
                {canVote && (
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={() => voteMutation.mutate({ proposalId: proposal.proposal_id, choice: "for" })}
                      disabled={voteMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Vote For
                    </Button>
                    <Button
                      onClick={() => voteMutation.mutate({ proposalId: proposal.proposal_id, choice: "against" })}
                      disabled={voteMutation.isPending}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Vote Against
                    </Button>
                    <Button
                      onClick={() => voteMutation.mutate({ proposalId: proposal.proposal_id, choice: "abstain" })}
                      disabled={voteMutation.isPending}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                    >
                      Abstain
                    </Button>
                  </div>
                )}

                {userHasVoted && (
                  <div className="flex items-center gap-2 text-sm text-green-300 p-3 bg-green-950/30 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-4 h-4" />
                    <span>You have voted on this proposal</span>
                  </div>
                )}

                {!canVote && !userHasVoted && votingPower === 0 && (
                  <div className="text-sm text-amber-400/70 p-3 bg-amber-950/30 rounded-lg border border-amber-500/30">
                    You need QTC to vote on proposals
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}