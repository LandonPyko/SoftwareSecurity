import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface Article {
  id: string;
  url: string;
  title?: string;
  postedBy: string; // username
  createdAt: number;
}

interface AppState {
  currentUser: User | null;
  users: User[]; // Store registered users
  articles: Article[];
  
  login: (username: string) => boolean;
  register: (username: string) => boolean;
  logout: () => void;
  
  addArticle: (url: string) => void;
  deleteArticle: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [
        { id: 'admin-id', username: 'admin', role: 'admin' } // Default admin user
      ],
      articles: [],

      login: (username: string) => {
        const { users } = get();
        const user = users.find(u => u.username === username);
        
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      register: (username: string) => {
        const { users } = get();
        if (users.some(u => u.username === username)) {
          return false; // User already exists
        }

        const newUser: User = { 
          id: nanoid(), 
          username, 
          role: 'user' 
        };
        
        set({ 
          users: [...users, newUser],
          currentUser: newUser 
        });
        return true;
      },

      logout: () => set({ currentUser: null }),

      addArticle: (url: string) => {
        const { currentUser, articles } = get();
        if (!currentUser) return;

        const newArticle: Article = {
          id: nanoid(),
          url,
          postedBy: currentUser.username,
          createdAt: Date.now(),
        };

        set({ articles: [newArticle, ...articles] });
      },

      deleteArticle: (id: string) => {
        const { currentUser, articles } = get();
        if (!currentUser) return;

        // Filter logic: User can delete own, Admin can delete any
        const articleToDelete = articles.find(a => a.id === id);
        if (!articleToDelete) return;

        if (currentUser.role === 'admin' || articleToDelete.postedBy === currentUser.username) {
          set({ articles: articles.filter((a) => a.id !== id) });
        }
      },
    }),
    {
      name: 'linkshare-storage', // name of the item in the storage (must be unique)
    }
  )
);
