import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function CurrencyLedger({ mints, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Divine Currency Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 bg-purple-900/20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-200">
            <Sparkles className="w-5 h-5" />
            Immutable Ledger
          </CardTitle>
          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
            {mints.length} Total Mints
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {mints.length === 0 ? (
          <div className="p-12 text-center text-purple-400/60">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No currency minted yet</p>
            <p className="text-sm mt-1">Begin manifesting divine abundance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-purple-900/30 hover:bg-transparent">
                  <TableHead className="text-purple-400/70">Serial Number</TableHead>
                  <TableHead className="text-purple-400/70">Amount</TableHead>
                  <TableHead className="text-purple-400/70">Timestamp</TableHead>
                  <TableHead className="text-purple-400/70">Note</TableHead>
                  <TableHead className="text-purple-400/70">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mints.map((mint, index) => (
                  <motion.tr
                    key={mint.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-purple-900/20 hover:bg-purple-900/10 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-purple-300">
                      {mint.serial_number}
                    </TableCell>
                    <TableCell className="font-bold text-amber-300">
                      {mint.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-purple-400/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(mint.timestamp), "MMM d, yyyy HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-purple-300/80 max-w-xs truncate">
                      {mint.note || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="border-green-500/30 text-green-300 bg-green-950/30"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}