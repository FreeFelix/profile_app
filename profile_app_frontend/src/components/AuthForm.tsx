import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuthFormProps {
  onLogin: () => void;
}

export const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState<{ name: string; email: string; password: string; profileImage: File | null }>({
    name: "",
    email: "",
    password: "",
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [tab, setTab] = useState<"login" | "signup">("login");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSignupData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        onLogin();
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", signupData.name);
      formData.append("email", signupData.email);
      formData.append("password", signupData.password);
      if (signupData.profileImage) {
        formData.append("profile_image", signupData.profileImage);
      }

      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Account created!",
          description: "Welcome to ProfileApp. You can now log in.",
        });
        setTab("login"); // Switch to login tab after signup
        // Optionally, clear signup form here
        setSignupData({ name: "", email: "", password: "", profileImage: null });
        setPreviewImage("");
      } else {
        toast({
          title: "Signup failed",
          description: data.message || "Please check your details and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="signup">
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={previewImage} />
                <AvatarFallback className="text-lg">
                  {signupData.name ? signupData.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-gray-600 text-center">Add profile picture (optional)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={signupData.name}
              onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
              required
              name="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={signupData.email}
              onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
              required
              name="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={signupData.password}
              onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
              required
              name="password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};