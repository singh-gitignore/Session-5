import React, { createContext, useContext, useState, useEffect } from "react";
import { getOrCreateUserProfile, updateUserProfile, type UserProfile } from "@/lib/frontend-data";

interface SessionContextType {
  sessionId: string;
  userProfile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("ai_coach_session_id");
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("ai_coach_session_id", newId);
    return newId;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const profile = await getOrCreateUserProfile(sessionId);
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to initialize user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, [sessionId]);

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await updateUserProfile(sessionId, updates);
      setUserProfile(updated);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        userProfile,
        loading,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
