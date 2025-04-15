
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenAIKeyForm } from "@/components/apiConnection/OpenAIKeyForm";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { clearAllData } from "@/services/openAIOCRService";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Profile = () => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const handleClearAllData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Settings</h1>
        
        <Tabs defaultValue="api" className="space-y-4">
          <TabsList className="bg-neutral-900 border-neutral-800">
            <TabsTrigger value="api" className="data-[state=active]:bg-neutral-800 text-neutral-300 data-[state=active]:text-white">API Connection</TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-neutral-800 text-neutral-300 data-[state=active]:text-white">Data Management</TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-neutral-800 text-neutral-300 data-[state=active]:text-white">Account</TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-neutral-800 text-neutral-300 data-[state=active]:text-white">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="space-y-4">
            <OpenAIKeyForm />
          </TabsContent>
          
          <TabsContent value="data">
            <Card className="border-neutral-800">
              <CardHeader className="bg-neutral-900">
                <CardTitle className="text-white">Data Management</CardTitle>
                <CardDescription className="text-neutral-400">Manage your health data privacy</CardDescription>
              </CardHeader>
              <CardContent className="bg-neutral-950 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-neutral-200">Clear All Health Data</h3>
                  <p className="text-sm text-neutral-400">
                    Remove all your health reports and analysis data from this device. This action cannot be undone.
                  </p>
                  
                  <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="mt-2">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your health reports and analysis data. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllData}>
                          Yes, delete all data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div className="pt-3 border-t border-neutral-800">
                  <h3 className="text-sm font-medium text-neutral-200">Data Privacy</h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    All your data is stored locally on your device. We never store or share your health data on our servers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="border-neutral-800">
              <CardHeader className="bg-neutral-900">
                <CardTitle className="text-white">Account Settings</CardTitle>
                <CardDescription className="text-neutral-400">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="bg-neutral-950">
                <p className="text-neutral-500">Account management features coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card className="border-neutral-800">
              <CardHeader className="bg-neutral-900">
                <CardTitle className="text-white">User Preferences</CardTitle>
                <CardDescription className="text-neutral-400">Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent className="bg-neutral-950">
                <p className="text-neutral-500">Preference options coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
