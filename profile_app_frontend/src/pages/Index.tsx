
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthForm } from "@/components/AuthForm";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { UserDiscovery } from "@/components/UserDiscovery";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ProfileApp
            </h1>
            <p className="text-gray-600 mt-2">Connect, Share, Discover</p>
          </div>
          
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                Join our community and start connecting with amazing people
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm onLogin={() => setIsAuthenticated(true)} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ProfileApp
            </h1>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">My Profile</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <ProfileDashboard />
          </TabsContent>
          
          <TabsContent value="discover">
            <UserDiscovery />
          </TabsContent>
          
          <TabsContent value="following">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Following</h2>
              <p className="text-gray-600">See updates from people you follow</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
