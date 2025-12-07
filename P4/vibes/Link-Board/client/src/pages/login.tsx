import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useRegister } from "@/lib/api";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Password required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ username, password });
        toast({
          title: "Welcome back!",
          description: `Logged in as ${username}`,
        });
        setLocation("/");
      } else {
        await registerMutation.mutateAsync({ username, password });
        toast({
          title: "Account created!",
          description: `Welcome to LinkShare, ${username}`,
        });
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "Login failed" : "Registration failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-xl mb-4 shadow-lg">
          <Link className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">LinkShare</h1>
        <p className="text-muted-foreground text-lg">Discover and share interesting articles.</p>
      </div>

      <Card className="w-full max-w-md border-muted shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Sign in to your account" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Enter your details to access the platform" : "Join our community to start sharing"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
                className="bg-background/50"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                className="bg-background/50"
                disabled={isLoading}
              />
            </div>
            
            <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded border border-secondary">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Admin: <span className="font-mono text-primary">admin</span> / <span className="font-mono text-primary">admin</span></li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full font-medium" 
              size="lg" 
              data-testid="button-submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:underline underline-offset-4"
                data-testid="button-toggle-auth"
                disabled={isLoading}
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
