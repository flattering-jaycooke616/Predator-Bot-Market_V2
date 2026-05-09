import { useState } from "react";
import { Link } from "wouter";
import { useListBots, getListBotsQueryKey } from "@lintshiwe/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ArrowRight, Zap, TrendingUp, Download } from "lucide-react";

export default function Bots() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  
  const { data: bots, isLoading } = useListBots(
    { category },
    { query: { queryKey: getListBotsQueryKey({ category }) } }
  );

  const filteredBots = Array.isArray(bots) ? bots.filter(bot => 
    bot.name.toLowerCase().includes(search.toLowerCase()) ||
    bot.description.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const categories = ["Forex", "Crypto", "Indices", "Commodities"];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Marketplace</h1>
        <p className="text-xl text-muted-foreground">Discover institutional-grade Expert Advisors for MT4.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search bots..." 
            className="pl-10 h-12 bg-card border-white/10 text-white font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button 
            variant={category === undefined ? "default" : "outline"} 
            className={`h-12 font-mono whitespace-nowrap ${category === undefined ? 'bg-primary text-primary-foreground' : 'border-white/10 text-muted-foreground'}`}
            onClick={() => setCategory(undefined)}
          >
            All
          </Button>
          {categories.map(c => (
            <Button 
              key={c}
              variant={category === c ? "default" : "outline"} 
              className={`h-12 font-mono whitespace-nowrap ${category === c ? 'bg-primary text-primary-foreground' : 'border-white/10 text-muted-foreground'}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="bg-card border-white/5 overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none bg-white/5" />
              <CardHeader>
                <Skeleton className="h-6 w-2/3 bg-white/5" />
                <Skeleton className="h-4 w-full bg-white/5 mt-2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full bg-white/5" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="text-center py-24 bg-card border border-white/5 rounded-xl">
          <TerminalSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No algorithms found</h3>
          <p className="text-muted-foreground">Adjust your search parameters to find available systems.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots?.map((bot) => (
            <Link key={bot.id} href={`/bots/${bot.id}`}>
              <Card className="bg-card border-white/5 overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full">
                <div className="relative h-48 bg-background flex items-center justify-center overflow-hidden border-b border-white/5">
                  {bot.imageUrl ? (
                    <img src={bot.imageUrl} alt={bot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-card to-background flex items-center justify-center">
                      <TerminalSquare className="h-16 w-16 text-white/5" />
                    </div>
                  )}
                  {bot.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground font-mono font-bold uppercase tracking-widest text-[10px] px-2 py-0.5">
                        Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-white/10 text-white font-mono text-xs">
                      {bot.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                      {bot.name}
                    </CardTitle>
                    <div className="font-mono font-bold text-lg text-emerald-400">
                      {bot.currency === 'USD' ? '$' : bot.currency}{bot.price}
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground line-clamp-2">
                    {bot.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {bot.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                        <CheckCircle2 className="h-3 w-3 text-primary mr-1" />
                        {feature}
                      </div>
                    ))}
                    {bot.features.length > 3 && (
                      <div className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                        +{bot.features.length - 3}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardFooter className="pt-4 border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex items-center text-xs text-muted-foreground font-mono">
                    <Download className="h-3 w-3 mr-1" />
                    {bot.downloadsCount} deployed
                  </div>
                  <div className="flex items-center text-primary font-mono text-sm group-hover:translate-x-1 transition-transform">
                    Inspect <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
import { TerminalSquare, CheckCircle2 } from "lucide-react";