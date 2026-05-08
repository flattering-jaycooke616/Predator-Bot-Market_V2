import { useListMyPurchases, getListMyPurchasesQueryKey, useDownloadBot } from "@lintshiwe/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Download, TerminalSquare, AlertCircle, Clock, HardDriveDownload, Timer } from "lucide-react";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { toast } = useToast();
  const { data: purchases, isLoading, refetch } = useListMyPurchases({
    query: { queryKey: getListMyPurchasesQueryKey() }
  });

  const downloadBot = useDownloadBot();

  const handleDownload = (purchaseId: number, botName: string) => {
    downloadBot.mutate({ purchaseId }, {
      onSuccess: (data) => {
        toast({
          title: "Download Initiated",
          description: data.expiryNotice || `Downloads remaining: ${data.downloadsRemaining}`,
          className: "bg-primary text-primary-foreground border-none"
        });
        
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        const ext = botName.includes('.') ? '' : '.ex4';
        a.download = `${botName}${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        refetch();
      },
      onError: (err) => {
        toast({
          title: "Download Failed",
          description: (err as any)?.message || "An unexpected error occurred",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Command Center</h1>
        <p className="text-muted-foreground">Manage your deployed algorithms and licenses.</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="bg-card border-white/5">
              <CardHeader>
                <Skeleton className="h-6 w-1/2 bg-white/5 mb-2" />
                <Skeleton className="h-4 w-1/3 bg-white/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !purchases || purchases.length === 0 ? (
        <div className="text-center py-24 bg-card border border-white/5 rounded-xl">
          <HardDriveDownload className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="text-2xl font-bold text-white mb-2">No Systems Deployed</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Your arsenal is currently empty. Visit the marketplace to acquire institutional-grade algorithms.</p>
          <Link href="/bots">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider neon-glow">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => {
            const isExhausted = purchase.downloadCount >= purchase.maxDownloads;
            const isPending = purchase.status === "pending";
            const isRefunded = purchase.status === "refunded";
            const isCompleted = purchase.status === "completed";
            
            return (
              <Card key={purchase.id} className="bg-card border-white/5 flex flex-col h-full hover:border-white/10 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold text-white">
                      {purchase.bot?.name || "Unknown Bot"}
                    </CardTitle>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${
                      purchase.status === 'completed' ? 'border-emerald-500/50 text-emerald-400' :
                      purchase.status === 'pending' ? 'border-amber-500/50 text-amber-400' :
                      'border-red-500/50 text-red-400'
                    }`}>
                      {purchase.status}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    Order #{purchase.id.toString().padStart(6, '0')} • {format(new Date(purchase.createdAt), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="bg-background rounded border border-white/5 p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-mono text-white">${purchase.amountPaid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Downloads:</span>
                      <span className={`font-mono ${isExhausted ? 'text-destructive' : 'text-primary'}`}>
                        {purchase.downloadCount} / {purchase.maxDownloads}
                      </span>
                    </div>
                  </div>
                  
                  {isPending && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-amber-400/90 bg-amber-400/10 p-3 rounded border border-amber-500/20">
                      <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Awaiting Verification</p>
                        <p className="text-amber-400/70">Admin is reviewing your payment. You will be able to download once verified.</p>
                      </div>
                    </div>
                  )}

                  {isRefunded && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-red-400/90 bg-red-400/10 p-3 rounded border border-red-500/20">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Purchase Rejected</p>
                        <p className="text-red-400/70">Your payment could not be verified. Contact support for assistance.</p>
                      </div>
                    </div>
                  )}
                  
                  {isExhausted && isCompleted && (
                    <div className="mt-4 flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/10 p-3 rounded">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>Download limit reached for security purposes. Contact support for reset.</p>
                    </div>
                  )}
                  
                  {purchase.secondDownloadExpiresAt && purchase.downloadCount === 1 && isCompleted && (
                    <div className="mt-4 flex items-start gap-2 text-xs bg-primary/10 p-3 rounded border border-primary/20">
                      <Timer className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <div>
                        <p className="text-primary font-medium mb-1">Download Link Expiring Soon</p>
                        <p className="text-muted-foreground">Your download link will expire in <span className="text-primary font-mono">{formatDistanceToNow(new Date(purchase.secondDownloadExpiresAt), { addSuffix: true })}</span>. Download now to avoid losing access.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-4 border-t border-white/5">
                  <Button 
                    className="w-full font-mono uppercase tracking-wider" 
                    variant={isExhausted || !isCompleted ? "secondary" : "default"}
                    disabled={isExhausted || !isCompleted || downloadBot.isPending}
                    onClick={() => handleDownload(purchase.id, purchase.bot?.name || "bot")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExhausted ? 'Limit Reached' : 
                     isPending ? 'Awaiting Verification' :
                     isRefunded ? 'Rejected' :
                     'Download File'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
