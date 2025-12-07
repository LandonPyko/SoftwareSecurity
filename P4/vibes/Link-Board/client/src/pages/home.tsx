import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ExternalLink, Clock, User, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, useArticles, useCreateArticle, useDeleteArticle, Article } from "@/lib/api";

export default function Home() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: articles = [], isLoading: articlesLoading } = useArticles();
  const createArticleMutation = useCreateArticle();
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && !currentUser) {
      setLocation("/login");
    }
  }, [currentUser, userLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    try {
      new URL(url);
      
      let title = url;
      try {
        const urlObj = new URL(url);
        title = urlObj.hostname.replace("www.", "") + urlObj.pathname;
      } catch (e) {}

      await createArticleMutation.mutateAsync({ url, title });
      setUrl("");
      toast({
        title: "Link posted!",
        description: "Your link has been shared with the community.",
      });
    } catch (error: any) {
      toast({
        title: "Invalid URL",
        description: error.message || "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
    }
  };

  if (userLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <section className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-serif font-bold mb-4">Share a new discovery</h2>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL here (https://...)"
              className="flex-1 bg-background"
              data-testid="input-url"
              disabled={createArticleMutation.isPending}
            />
            <Button 
              type="submit" 
              data-testid="button-post"
              disabled={createArticleMutation.isPending}
            >
              {createArticleMutation.isPending ? "Posting..." : "Post Link"}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Shares</h3>
            <span className="text-xs text-muted-foreground">{articles.length} links</span>
          </div>

          {articlesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading articles...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {articles.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed"
                  >
                    <p>No links shared yet. Be the first!</p>
                  </motion.div>
                ) : (
                  articles.map((article) => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      currentUser={currentUser} 
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function ArticleCard({ article, currentUser }: { article: Article; currentUser: any }) {
  const deleteArticleMutation = useDeleteArticle();
  const isOwner = article.userId === currentUser.id;
  const isAdmin = currentUser.isAdmin;
  const canDelete = isOwner || isAdmin;

  let domain = "link";
  try {
    domain = new URL(article.url).hostname.replace("www.", "");
  } catch (e) {}

  const handleDelete = async () => {
    try {
      await deleteArticleMutation.mutateAsync(article.id);
    } catch (error: any) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-5 flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center text-xs text-muted-foreground mb-1 gap-2">
              <span className="flex items-center text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full">
                <Globe className="w-3 h-3 mr-1" />
                {domain}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center" title={new Date(article.createdAt).toLocaleString()}>
                <Clock className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-serif text-lg font-bold leading-tight truncate pr-4">
                {article.title || article.url}
              </h3>
            </a>

            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              Posted by <span className={`font-medium ml-1 ${isOwner ? 'text-foreground' : ''}`}>{article.username}</span>
              {isOwner && <span className="ml-2 text-xs bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">You</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <a 
              href={article.url}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            
            {canDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                data-testid={`button-delete-${article.id}`}
                title={isAdmin && !isOwner ? "Admin Delete" : "Delete"}
                disabled={deleteArticleMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
