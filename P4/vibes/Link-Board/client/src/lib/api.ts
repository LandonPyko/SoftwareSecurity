import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface Article {
  id: string;
  url: string;
  title: string;
  userId: string;
  username: string;
  createdAt: string;
}

async function fetchJSON(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await fetchJSON("/api/auth/me");
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return await fetchJSON("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return await fetchJSON("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await fetchJSON("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
    },
  });
}

export function useArticles() {
  return useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      return await fetchJSON("/api/articles");
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ url, title }: { url: string; title: string }) => {
      return await fetchJSON("/api/articles", {
        method: "POST",
        body: JSON.stringify({ url, title }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await fetchJSON(`/api/articles/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
