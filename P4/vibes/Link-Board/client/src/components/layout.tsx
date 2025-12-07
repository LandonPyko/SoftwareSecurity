import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Link as LinkIcon } from "lucide-react";
import { useCurrentUser, useLogout } from "@/lib/api";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: currentUser } = useCurrentUser();
  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-serif font-bold tracking-tight">LinkShare</h1>
            </div>
          </Link>

          {currentUser && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                <span className="font-medium text-foreground">{currentUser.username}</span>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive transition-colors"
                data-testid="button-logout"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {children}
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-auto">
        <p>&copy; {new Date().getFullYear()} LinkShare. Design prototype.</p>
      </footer>
    </div>
  );
}
