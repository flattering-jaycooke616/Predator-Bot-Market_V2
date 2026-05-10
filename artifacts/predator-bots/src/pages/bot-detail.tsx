import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, TerminalSquare, Shield, Zap, Lock, CreditCard, Activity, Cpu, Clock } from "lucide-react";

export default function BotDetail() {
  const params = useParams();
  const id = params.id as Id<"bots">;
  const { user } = useUser();
  const { toast } = useToast();
  
  const bot = useQuery(api.bots.getById, id ? { id } : "skip");

  const purchases = useQuery(api.purchases.list, {});

  const createPurchase = useMutation(api.purchases.create);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");

  const userPurchaseForBot = purchases?.find(p => p.botId === id);
  const hasPendingPurchase = userPurchaseForBot?.status === "pending";
  const hasCompletedPurchase = userPurchaseForBot?.status === "completed";
  const hasRefundedPurchase = userPurchaseForBot?.status === "refunded";

  const handlePurchase = async () => {
    if (!paymentRef) {
      toast({
        title: "Error",
        description: "Please enter a payment reference",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPurchase({
        botId: id,
        paymentReference: paymentRef
      });
      setIsPurchaseDialogOpen(false);
      toast({
        title: "Purchase Submitted",
        description: "Your payment is being verified. Download will be available once approved.",
        className: "bg-primary text-primary-foreground border-none"
      });
    } catch (err) {
      toast({
        title: "Purchase Failed",
        description: (err as Error)?.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  if (bot === undefined) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-8 bg-white/5" />
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full bg-white/5" />
            <Skeleton className="h-12 w-3/4 bg-white/5" />
            <Skeleton className="h-32 w-full bg-white/5" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <TerminalSquare className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Bot Not Found</h1>
        <p className="text-muted-foreground mb-8">The requested algorithm does not exist or has been removed.</p>
        <Link href="/bots">
          <Button variant="outline" className="font-mono border-white/10 text-white">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/bots" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Arsenal
      </Link>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 font-mono">
                {bot.category}
              </Badge>
              {bot.featured && (
                <Badge variant="outline" className="border-amber-500 text-amber-500 font-mono">
                  PRO SYSTEM
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              {bot.name}
            </h1>
            
            <p className="text-xl text-muted-foreground font-light leading-relaxed">
              {bot.description}
            </p>
          </div>

          <div className="aspect-video lg:aspect-[21/9] bg-card border border-white/5 rounded-xl overflow-hidden relative group">
            {bot.imageUrl ? (
              bot.imageUrl.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                <video src={bot.imageUrl} controls className="w-full h-full object-cover" preload="metadata" />
              ) : (
                <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-card to-background">
                <Cpu className="h-24 w-24 text-white/5 mb-4" />
                <div className="font-mono text-white/20 text-sm">NO_PREVIEW_DATA_FOUND</div>
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white border-b border-white/5 pb-4">System Documentation</h3>
            <div className="prose prose-invert prose-emerald max-w-none text-muted-foreground">
              {bot.longDescription ? (
                <div dangerouslySetInnerHTML={{ __html: bot.longDescription.replace(/\n/g, '<br/>') }} />
              ) : (
                <p>No extended documentation provided for this system.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 sticky top-24 space-y-6">
          <div className="glass-panel p-8 rounded-xl">
            <div className="flex justify-between items-baseline mb-6">
              <div className="text-sm font-mono text-muted-foreground uppercase tracking-wider">License Fee</div>
              <div className="text-4xl font-bold text-white font-mono">
                {bot.currency === 'ZAR' ? 'R' : bot.currency === 'USD' ? '$' : bot.currency}{bot.price}
              </div>
            </div>

            {!user ? (
              <Link href="/sign-in">
                <Button className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider text-base neon-glow">
                  Sign In to Purchase
                </Button>
              </Link>
            ) : hasPendingPurchase ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-amber-400 font-medium text-sm">Verification Pending</p>
                    <p className="text-amber-400/70 text-xs">Admin is reviewing your payment</p>
                  </div>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full h-14 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-mono uppercase tracking-wider text-base border border-amber-500/30">
                    View Status in Dashboard
                  </Button>
                </Link>
              </div>
            ) : hasCompletedPurchase ? (
              <Link href="/dashboard">
                <Button className="w-full h-14 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-mono uppercase tracking-wider text-base border border-emerald-500/30">
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Already Owned
                </Button>
              </Link>
            ) : hasRefundedPurchase ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <TerminalSquare className="h-5 w-5 text-red-400 shrink-0" />
                  <div>
                    <p className="text-red-400 font-medium text-sm">Previous Purchase Rejected</p>
                    <p className="text-red-400/70 text-xs">Contact support for assistance</p>
                  </div>
                </div>
              </div>
            ) : (
              <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider text-base neon-glow">
                    Acquire License
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] bg-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Secure Purchase</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Complete payment to instantly download {bot.name}. Admin verification required before download access is granted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6 space-y-6">
                    <div className="bg-background p-4 rounded-lg border border-white/5 flex justify-between items-center">
                      <span className="font-mono text-muted-foreground">Total Due:</span>
                      <span className="text-2xl font-bold text-emerald-400 font-mono">R{bot.price}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Payment Instructions</Label>
                      <div className="text-sm bg-white/5 p-3 rounded border border-white/5 text-muted-foreground leading-relaxed">
                        Please transfer exactly <strong className="text-white">R{bot.price}</strong> via EFT or payment method provided.<br/>
                        <span className="block mt-2 text-xs">Contact us for payment details if not provided.</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="ref" className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Transaction Hash / Reference</Label>
                      <Input 
                        id="ref" 
                        placeholder="Enter TxHash to verify" 
                        className="bg-background border-white/10 font-mono text-sm h-12"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
                    <Button onClick={handlePurchase} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Submit for Verification
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <div className="mt-8 space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Lock className="h-4 w-4 mr-3 text-primary" /> One-time payment, lifetime access
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="h-4 w-4 mr-3 text-primary" /> Verified clean code (no malware)
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-3 text-primary" /> Updates included
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-3 text-primary" /> Download links expire after 5 hours
              </div>
            </div>
          </div>

          <div className="bg-card border border-white/5 p-6 rounded-xl">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">System Features</h4>
            <ul className="space-y-3">
              {bot.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
