import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrialConfiguration } from "@/components/protrials/TrialConfiguration";
import { MessagingControl } from "@/components/protrials/MessagingControl";
import { UserTrialsManagement } from "@/components/protrials/UserTrialsManagement";
import { TrialAnalyticsDashboard } from "@/components/protrials/TrialAnalyticsDashboard";
import { TrialExperiments } from "@/components/protrials/TrialExperiments";
import { ComplianceLog } from "@/components/protrials/ComplianceLog";
import { Settings, MessageSquare, Users, BarChart3, FlaskConical, Shield } from "lucide-react";

export default function ProTrials() {
  const [activeTab, setActiveTab] = useState("config");

  return (
    <AdminLayout>
      <AdminHeader
        title="Pro Trials & Subscriptions"
        subtitle="Manage trial configurations, messaging, and user subscriptions"
      />
      
      <div className="p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-muted/50 p-1">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messaging</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">User Trials</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="experiments" className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              <span className="hidden sm:inline">Experiments</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="animate-fade-in">
            <TrialConfiguration />
          </TabsContent>

          <TabsContent value="messaging" className="animate-fade-in">
            <MessagingControl />
          </TabsContent>

          <TabsContent value="users" className="animate-fade-in">
            <UserTrialsManagement />
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <TrialAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="experiments" className="animate-fade-in">
            <TrialExperiments />
          </TabsContent>

          <TabsContent value="compliance" className="animate-fade-in">
            <ComplianceLog />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
