import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, MinusCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const statusColor = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  passed: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  rejected: "bg-red-500/20 text-red-300 border-red-500/40",
  executed: "bg-purple-500/20 text-purple-300 border-purple-500/40",
};

export default function ProposalVotePanel({ votingPower, user }) {
  const [expanded, setExpanded] = useState(null);
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: () => base44.entities.Proposal.list("-created_date", 20),
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ["myVotes", user?.email],
    queryFn: () =>
      user ? base44.entities.Vote.filter({ voter_email: user.email }) : [],
    enabled: !!user,
  });

  const castVote = useMutation({
    mutationFn: async ({ proposalId, choice }) => {
      const alreadyVoted = myVotes.find((v) => v.proposal_id === proposalId);
      if (alreadyVoted) throw new Error("Already voted");
      await base44.entities.Vote.create({
        proposal_id: proposalId,
        voter_email: user.email,
        vote_choice: choice,
        voting_power: votingPower,
        vote_timestamp: new Date().toISOString(),
        vote_signature: `SIG-${Date.now()}`,
      });
      const prop = proposals.find((p) => p.proposal_id === proposalId);
      if (prop) {
        const update = {};
        if (choice === "for") update.total_votes_for = (prop.total_votes_for || 0) + votingPower;
        else if (choice === "against") update.total_votes_against = (prop.total_votes_against || 0) + votingPower;
        else update.total_votes_abstain = (prop.total_votes_abstain || 0) + votingPower;
        await base44.entities.Proposal.update(prop.id, update);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["proposals"]);
      queryClient.invalidateQueries(["myVotes"]);
      toast({ title: "Vote cast", description: "Your vote has been recorded on-chain." });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const votedIds = new Set(myVotes.map((v) => v.proposal_id));

  if (isLoading)
    return <div className="text-purple-400/60 py-12 text-center">Loading proposals…</div>;

  if (!proposals.length)
    return (
      <div className="text-purple-400/60 py-12 text-center">
        No governance proposals found. Create one to get started.
      </div>
    );

  return (
    <div className="space-y-4">
      {proposals.map((p) => {
        const total = (p.total_votes_for || 0) + (p.total_votes_against || 0) + (p.total_votes_abstain || 0);
        const forPct = total ? Math.round(((p.total_votes_for || 0) / total) * 100) : 0;
        const againstPct = total ? Math.round(((p.total_votes_against || 0) / total) * 100) : 0;
        const hasVoted = votedIds.has(p.proposal_id);
        const isOpen = expanded === p.proposal_id;

        return (
          <Card key={p.id} className="bg-slate-900/60 border-purple-900/40">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setExpanded(isOpen ? null : p.proposal_id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`text-xs border ${statusColor[p.status] || statusColor.pending}`}>
                      {p.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-purple-400 border-purple-700/50">
                      {p.proposal_type?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <CardTitle className="text-purple-100 text-base font-semibold">{p.title}</CardTitle>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
                )}
              </div>

              {/* Vote bars always visible */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="w-12">For {forPct}%</span>
                  <Progress value={forPct} className="h-1.5 flex-1 bg-slate-800" />
                </div>
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <XCircle className="w-3 h-3" />
                  <span className="w-12">Against {againstPct}%</span>
                  <Progress value={againstPct} className="h-1.5 flex-1 bg-slate-800" />
                </div>
              </div>
            </CardHeader>

            {isOpen && (
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-purple-300/80 leading-relaxed">{p.description}</p>

                {p.requested_amount > 0 && (
                  <div className="text-xs text-amber-400/80 bg-amber-950/30 border border-amber-700/30 rounded-lg px-3 py-2">
                    Requests <strong>{p.requested_amount.toLocaleString()} {p.requested_currency}</strong> from treasury
                  </div>
                )}

                {p.voting_end_date && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-400/60">
                    <Clock className="w-3 h-3" />
                    Voting ends: {new Date(p.voting_end_date).toLocaleDateString()}
                  </div>
                )}

                {p.status === "active" && user && (
                  <div className="flex gap-2 pt-2">
                    {hasVoted ? (
                      <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> You already voted on this proposal
                      </div>
                    ) : votingPower > 0 ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-700 hover:bg-emerald-600 text-white"
                          onClick={() => castVote.mutate({ proposalId: p.proposal_id, choice: "for" })}
                          disabled={castVote.isPending}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> For
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-800 hover:bg-red-700 text-white"
                          onClick={() => castVote.mutate({ proposalId: p.proposal_id, choice: "against" })}
                          disabled={castVote.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Against
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
                          onClick={() => castVote.mutate({ proposalId: p.proposal_id, choice: "abstain" })}
                          disabled={castVote.isPending}
                        >
                          <MinusCircle className="w-3.5 h-3.5 mr-1" /> Abstain
                        </Button>
                      </>
                    ) : (
                      <div className="text-xs text-yellow-400/80">
                        You need QTC balance to vote on this proposal.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}