import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useLocation } from "wouter";
import { useAdminListPurchases, getAdminListPurchasesQueryKey, useListBots, getListBotsQueryKey, useAdminCreateBot, useAdminUpdateBot, useAdminDeleteBot, useRequestUploadUrl, useAdminVerifyPurchase, useAdminRejectPurchase } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Pencil, Trash2, LayoutDashboard, CheckCircle, XCircle, Eye, FileArchive, FileCode } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Queries
  const { data: purchases } = useAdminListPurchases({ query: { queryKey: getAdminListPurchasesQueryKey() } });
  const { data: bots } = useListBots({}, { query: { queryKey: getListBotsQueryKey() } });

  // Mutations
  const createBot = useAdminCreateBot();
  const updateBot = useAdminUpdateBot();
  const deleteBot = useAdminDeleteBot();
  const requestUploadUrl = useRequestUploadUrl();
  const verifyPurchase = useAdminVerifyPurchase();
  const rejectPurchase = useAdminRejectPurchase();

  const [isBotDialogOpen, setIsBotDialogOpen] = useState(false);
  const [editingBotId, setEditingBotId] = useState<number | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", longDescription: "", 
    price: "", currency: "USD", category: "Forex", 
    features: "", imageUrl: "", fileObjectPath: "", 
    featured: false, active: true
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "", slug: "", description: "", longDescription: "", 
      price: "", currency: "USD", category: "Forex", 
      features: "", imageUrl: "", fileObjectPath: "", 
      featured: false, active: true
    });
    setFile(null);
    setEditingBotId(null);
  };

  const handleEdit = (bot: any) => {
    setFormData({
      name: bot.name,
      slug: bot.slug,
      description: bot.description,
      longDescription: bot.longDescription || "",
      price: bot.price.toString(),
      currency: bot.currency,
      category: bot.category,
      features: bot.features.join("\n"),
      imageUrl: bot.imageUrl || "",
      fileObjectPath: bot.fileObjectPath || "",
      featured: bot.featured,
      active: bot.active
    });
    setEditingBotId(bot.id);
    setIsBotDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this bot?")) {
      deleteBot.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
          toast({ title: "Bot Deleted" });
        }
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let objectPath = formData.fileObjectPath;

      if (file) {
        const uploadUrlRes = await requestUploadUrl.mutateAsync({
          data: { filename: file.name, contentType: file.type || 'application/octet-stream' }
        });
        
        await fetch(uploadUrlRes.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || 'application/octet-stream' },
          body: file
        });
        
        objectPath = uploadUrlRes.objectPath;
      }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        longDescription: formData.longDescription,
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        features: formData.features.split("\n").filter(f => f.trim() !== ""),
        imageUrl: formData.imageUrl,
        fileObjectPath: objectPath,
        featured: formData.featured,
        active: formData.active
      };

      if (editingBotId) {
        await updateBot.mutateAsync({ id: editingBotId, data: payload });
        toast({ title: "Bot Updated" });
      } else {
        await createBot.mutateAsync({ data: payload });
        toast({ title: "Bot Created" });
      }

      setIsBotDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = (purchaseId: number) => {
    verifyPurchase.mutate({ id: purchaseId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPurchasesQueryKey() });
        toast({ title: "Purchase Verified", description: "Client can now download their bot.", className: "bg-primary text-primary-foreground" });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to verify purchase", variant: "destructive" });
      }
    });
  };

  const handleReject = (purchaseId: number) => {
    rejectPurchase.mutate({ id: purchaseId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPurchasesQueryKey() });
        toast({ title: "Purchase Rejected" });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to reject purchase", variant: "destructive" });
      }
    });
  };

  const pendingPurchases = purchases?.filter(p => p.status === "pending") || [];
  const completedPurchases = purchases?.filter(p => p.status === "completed") || [];
  const refundedPurchases = purchases?.filter(p => p.status === "refunded") || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" /> Admin Control
          </h1>
          <p className="text-muted-foreground">Manage marketplace inventory, orders, and verifications.</p>
        </div>
      </div>

      <Tabs defaultValue="bots" className="w-full">
        <TabsList className="mb-8 bg-card border border-white/5">
          <TabsTrigger value="bots" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Algorithm Inventory</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Pending Verification {pendingPurchases.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-black border-none">{pendingPurchases.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="bots">
          <div className="flex justify-end mb-4">
            <Dialog open={isBotDialogOpen} onOpenChange={(open) => { setIsBotDialogOpen(open); if(!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground font-mono">
                  <Plus className="mr-2 h-4 w-4" /> Add Algorithm
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] bg-card border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBotId ? "Edit" : "Create"} Algorithm</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input className="bg-background border-white/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input className="bg-background border-white/10" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" className="bg-background border-white/10" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input className="bg-background border-white/10" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Short Description</Label>
                    <Input className="bg-background border-white/10" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Long Description (HTML allowed)</Label>
                    <Textarea className="bg-background border-white/10 h-32" value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Features (One per line)</Label>
                    <Textarea className="bg-background border-white/10" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Image URL</Label>
                    <Input className="bg-background border-white/10" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2 p-4 border border-white/5 rounded-lg bg-background/50">
                    <Label>Bot File (.ex4, .mq4, or .zip)</Label>
                    <Input type="file" className="bg-background border-white/10" accept=".ex4,.mq4,.zip" onChange={e => setFile(e.target.files?.[0] || null)} />
                    {formData.fileObjectPath && !file && <p className="text-xs text-muted-foreground mt-1">Current file: {formData.fileObjectPath}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Accepted formats: .ex4 (compiled), .mq4 (source), .zip (archive)</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch checked={formData.featured} onCheckedChange={c => setFormData({...formData, featured: c})} />
                    <Label>Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch checked={formData.active} onCheckedChange={c => setFormData({...formData, active: c})} />
                    <Label>Active (Visible to users)</Label>
                  </div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleSubmit} disabled={uploading}>
                  {uploading ? "Processing..." : (editingBotId ? "Update Algorithm" : "Create Algorithm")}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border border-white/5 bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Downloads</TableHead>
                  <TableHead className="text-muted-foreground">File</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bots?.map((bot) => (
                  <TableRow key={bot.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-mono text-muted-foreground">#{bot.id}</TableCell>
                    <TableCell className="font-medium text-white">{bot.name}</TableCell>
                    <TableCell className="font-mono text-emerald-400">${bot.price}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{bot.downloadsCount}</TableCell>
                    <TableCell>
                      {bot.fileObjectPath ? (
                        <Badge variant="outline" className="border-primary/50 text-primary font-mono text-[10px]">
                          {bot.fileObjectPath.endsWith('.zip') ? <FileArchive className="h-3 w-3 mr-1" /> : <FileCode className="h-3 w-3 mr-1" />}
                          {bot.fileObjectPath.split('/').pop()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">No file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {bot.active ? <Badge className="bg-primary/20 text-primary border-none">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(bot)} className="text-muted-foreground hover:text-white"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(bot.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!bots?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No algorithms found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          {pendingPurchases.length === 0 ? (
            <div className="text-center py-24 bg-card border border-white/5 rounded-xl">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6 opacity-40" />
              <h3 className="text-2xl font-bold text-white mb-2">All Clear</h3>
              <p className="text-muted-foreground">No pending purchases awaiting verification.</p>
            </div>
          ) : (
            <div className="rounded-md border border-white/5 bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Order ID</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">User ID</TableHead>
                    <TableHead className="text-muted-foreground">Algorithm</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Payment Ref</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPurchases.map((purchase) => (
                    <TableRow key={purchase.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-mono text-muted-foreground">#{purchase.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(purchase.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">{purchase.userId}</TableCell>
                      <TableCell className="text-white">{purchase.bot?.name}</TableCell>
                      <TableCell className="font-mono text-emerald-400">${purchase.amountPaid}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[150px] truncate">{purchase.paymentReference || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setViewingPurchase(purchase)} className="text-muted-foreground hover:text-white" title="View Details"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleVerify(purchase.id)} className="text-emerald-400 hover:text-emerald-300" title="Verify & Approve"><CheckCircle className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleReject(purchase.id)} className="text-destructive hover:text-destructive/80" title="Reject"><XCircle className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Tabs defaultValue="completed" className="w-full">
            <TabsList className="mb-4 bg-card border border-white/5">
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed ({completedPurchases.length})</TabsTrigger>
              <TabsTrigger value="refunded" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Refunded ({refundedPurchases.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="completed">
              <div className="rounded-md border border-white/5 bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Order ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">User ID</TableHead>
                      <TableHead className="text-muted-foreground">Algorithm</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Downloads</TableHead>
                      <TableHead className="text-right text-muted-foreground">Payment Ref</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-mono text-muted-foreground">#{purchase.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(purchase.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">{purchase.userId}</TableCell>
                        <TableCell className="text-white">{purchase.bot?.name}</TableCell>
                        <TableCell className="font-mono text-emerald-400">${purchase.amountPaid}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{purchase.downloadCount}/{purchase.maxDownloads}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground max-w-[150px] truncate">{purchase.paymentReference || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {!completedPurchases.length && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No completed purchases.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="refunded">
              <div className="rounded-md border border-white/5 bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Order ID</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">User ID</TableHead>
                      <TableHead className="text-muted-foreground">Algorithm</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-right text-muted-foreground">Payment Ref</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refundedPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-mono text-muted-foreground">#{purchase.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(purchase.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">{purchase.userId}</TableCell>
                        <TableCell className="text-white">{purchase.bot?.name}</TableCell>
                        <TableCell className="font-mono text-emerald-400">${purchase.amountPaid}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground max-w-[150px] truncate">{purchase.paymentReference || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {!refundedPurchases.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No refunded purchases.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Purchase Detail Dialog */}
      <Dialog open={!!viewingPurchase} onOpenChange={(open) => { if(!open) setViewingPurchase(null); }}>
        <DialogContent className="sm:max-w-[500px] bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Purchase Details</DialogTitle>
            <DialogDescription>Order #{viewingPurchase?.id.toString().padStart(6, '0')}</DialogDescription>
          </DialogHeader>
          {viewingPurchase && (
            <div className="space-y-4 py-4">
              <div className="bg-background rounded border border-white/5 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Algorithm:</span>
                  <span className="text-white font-medium">{viewingPurchase.bot?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-mono text-emerald-400">${viewingPurchase.amountPaid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs text-muted-foreground">{viewingPurchase.userId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Ref:</span>
                  <span className="font-mono text-xs text-primary">{viewingPurchase.paymentReference || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(viewingPurchase.createdAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={`font-mono text-[10px] uppercase ${
                    viewingPurchase.status === 'completed' ? 'border-emerald-500/50 text-emerald-400' :
                    viewingPurchase.status === 'pending' ? 'border-amber-500/50 text-amber-400' :
                    'border-red-500/50 text-red-400'
                  }`}>
                    {viewingPurchase.status}
                  </Badge>
                </div>
              </div>
              {viewingPurchase.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => { handleReject(viewingPurchase.id); setViewingPurchase(null); }}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button className="bg-primary text-primary-foreground" onClick={() => { handleVerify(viewingPurchase.id); setViewingPurchase(null); }}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Verify & Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
