import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Sparkles, Clock, AlertTriangle, CheckCircle, Save, Globe, Edit2, Eye } from "lucide-react";
import { useTrialMessages } from "@/hooks/useTrialMessages";
import type { Database } from "@/integrations/supabase/types";

type TrialMessageType = Database["public"]["Enums"]["trial_message_type"];

const messageTypes: Record<TrialMessageType, { label: string; icon: typeof Sparkles; color: string }> = {
  onboarding: { label: "Onboarding", icon: Sparkles, color: "text-primary" },
  day_2_reminder: { label: "Day 2 Reminder", icon: Clock, color: "text-accent" },
  day_3_warning: { label: "Day 3 Warning", icon: AlertTriangle, color: "text-warning" },
  downgrade_confirmation: { label: "Downgrade Confirmation", icon: AlertTriangle, color: "text-destructive" },
  conversion_success: { label: "Conversion Success", icon: CheckCircle, color: "text-success" },
};

const regions = [
  { value: "global", label: "Global (Default)" },
  { value: "us", label: "United States" },
  { value: "eu", label: "Europe" },
  { value: "apac", label: "Asia Pacific" },
  { value: "latam", label: "Latin America" },
];

export function MessagingControl() {
  const { messages, isLoading, updateMessage } = useTrialMessages();
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState<typeof messages[0] | null>(null);
  const [editForm, setEditForm] = useState({ title: "", body: "", cta_text: "" });

  const handleStartEdit = (message: typeof messages[0]) => {
    setEditingMessage(message.id);
    setEditForm({
      title: message.title,
      body: message.body,
      cta_text: message.cta_text || "",
    });
  };

  const handleSave = async (id: string) => {
    await updateMessage(id, editForm);
    setEditingMessage(null);
  };

  const getMessageConfig = (type: TrialMessageType) => {
    return messageTypes[type] || messageTypes.onboarding;
  };

  const filteredMessages = messages.filter((msg) => 
    selectedRegion === "global" ? msg.region === "global" : msg.region === selectedRegion
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Region Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Regional Messaging</CardTitle>
                <CardDescription>Customize messages by region</CardDescription>
              </div>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Message Cards */}
      <div className="grid gap-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No messages configured for this region.
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => {
            const config = getMessageConfig(message.message_type);
            const Icon = config.icon;
            const isEditing = editingMessage === message.id;

            return (
              <Card key={message.id} className={isEditing ? "ring-2 ring-primary" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{config.label}</CardTitle>
                        <CardDescription className="text-xs">
                          Region: {regions.find((r) => r.value === message.region)?.label}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={message.is_active ? "default" : "secondary"}>
                        {message.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={message.is_active}
                        onCheckedChange={(is_active) => updateMessage(message.id, { is_active })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewMessage(message)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => isEditing ? setEditingMessage(null) : handleStartEdit(message)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {isEditing ? (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message Body</Label>
                      <Textarea
                        value={editForm.body}
                        onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Button Text</Label>
                      <Input
                        value={editForm.cta_text}
                        onChange={(e) => setEditForm({ ...editForm, cta_text: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingMessage(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSave(message.id)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Message
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p className="font-medium">{message.title}</p>
                      <p className="text-sm text-muted-foreground">{message.body}</p>
                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs">
                          CTA: {message.cta_text || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewMessage} onOpenChange={() => setPreviewMessage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Message Preview</DialogTitle>
            <DialogDescription>How it will appear to users</DialogDescription>
          </DialogHeader>
          {previewMessage && (
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{previewMessage.title}</h3>
              <p className="text-muted-foreground">{previewMessage.body}</p>
              <Button className="w-full">{previewMessage.cta_text || "Continue"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
