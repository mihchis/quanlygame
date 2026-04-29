"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db, isConfigValid } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { LibraryItem, GameStatus } from "@/types/game";
import toast from "react-hot-toast";

export function useLibrary() {
  const { user } = useAuth();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isConfigValid) {
      setLibrary([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "library"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LibraryItem[];
      setLibrary(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Background "Self-Healing" for legacy data
  useEffect(() => {
    if (loading || library.length === 0 || !user) return;

    const repairLegacyItems = async () => {
      // Find items missing critical new data (e.g., platforms)
      const legacyItems = library.filter(item => !item.platforms || item.platforms.length === 0);
      
      if (legacyItems.length === 0) return;

      // Repair one item at a time to avoid API rate limits
      const item = legacyItems[0];
      const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;
      
      if (!apiKey) return;

      try {
        const response = await fetch(`https://api.rawg.io/api/games/${item.gameId}?key=${apiKey}`);
        if (!response.ok) throw new Error("API Fetch failed");
        
        const data = await response.json();
        
        await updateDoc(doc(db, "library", item.id), {
          platforms: data.platforms?.map((p: any) => p.platform.name) || [],
          // Initialize other new fields if needed
          updatedAt: serverTimestamp(),
        });
        console.log(`Auto-updated data for: ${item.name}`);
      } catch (error) {
        console.error(`Failed to auto-update ${item.name}:`, error);
      }
    };

    // Delay start to prioritize main UI loading
    const timer = setTimeout(repairLegacyItems, 5000);
    return () => clearTimeout(timer);
  }, [library, loading, user]);

  const addToLibrary = async (game: any, status: GameStatus = "plan-to-play") => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm game");
      return;
    }

    // Check if already in library
    const exists = library.find((item) => item.gameId === game.id);
    if (exists) {
      toast.error("Game đã có trong thư viện");
      return;
    }

    try {
      await addDoc(collection(db, "library"), {
        userId: user.uid,
        gameId: game.id,
        name: game.name,
        backgroundImage: game.background_image,
        platforms: game.platforms?.map((p: any) => p.platform.name) || [],
        status,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        achievements: [],
        quests: [],
      });
      toast.success("Đã thêm vào thư viện!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi thêm game");
    }
  };

  const updateGameStatus = async (id: string, status: GameStatus) => {
    try {
      await updateDoc(doc(db, "library", id), {
        status,
        updatedAt: serverTimestamp(),
      });
      toast.success("Đã cập nhật trạng thái!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const removeFromLibrary = async (id: string) => {
    try {
      await deleteDoc(doc(db, "library", id));
      toast.success("Đã xóa khỏi thư viện");
    } catch (error) {
      toast.error("Lỗi khi xóa game");
    }
  };

  const updateGameProgress = async (id: string, data: Partial<LibraryItem>) => {
    try {
      await updateDoc(doc(db, "library", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      toast.error("Lỗi khi cập nhật tiến độ");
    }
  };

  return {
    library,
    loading,
    addToLibrary,
    updateGameStatus,
    removeFromLibrary,
    updateGameProgress,
  };
}
