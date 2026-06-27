import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { SEED_REPORTS } from "@/data/communityReports";
import type { CommunityReport, Itinerary } from "@/data/types";

interface AppContextValue {
  itineraries: Itinerary[];
  saveItinerary: (it: Itinerary) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  reports: CommunityReport[];
  addReport: (
    r: Omit<CommunityReport, "id" | "timestamp" | "upvotes">,
  ) => void;
  upvoteReport: (id: string) => void;
}

const AppContext = createContext<AppContextValue>({
  itineraries: [],
  saveItinerary: async () => {},
  deleteItinerary: async () => {},
  reports: [],
  addReport: () => {},
  upvoteReport: () => {},
});

const ITINERARIES_KEY = "@yatrai_itineraries";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>(SEED_REPORTS);

  useEffect(() => {
    AsyncStorage.getItem(ITINERARIES_KEY)
      .then((raw) => {
        if (raw) setItineraries(JSON.parse(raw) as Itinerary[]);
      })
      .catch(() => {});
  }, []);

  const saveItinerary = useCallback(async (it: Itinerary) => {
    setItineraries((prev) => {
      const updated = [it, ...prev.filter((i) => i.id !== it.id)];
      AsyncStorage.setItem(ITINERARIES_KEY, JSON.stringify(updated)).catch(
        () => {},
      );
      return updated;
    });
  }, []);

  const deleteItinerary = useCallback(async (id: string) => {
    setItineraries((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      AsyncStorage.setItem(ITINERARIES_KEY, JSON.stringify(updated)).catch(
        () => {},
      );
      return updated;
    });
  }, []);

  const addReport = useCallback(
    (r: Omit<CommunityReport, "id" | "timestamp" | "upvotes">) => {
      const newReport: CommunityReport = {
        ...r,
        id: `r-${Date.now()}`,
        timestamp: Date.now(),
        upvotes: 0,
      };
      setReports((prev) => [newReport, ...prev]);
    },
    [],
  );

  const upvoteReport = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              upvotes: r.userUpvoted ? r.upvotes - 1 : r.upvotes + 1,
              userUpvoted: !r.userUpvoted,
            }
          : r,
      ),
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        itineraries,
        saveItinerary,
        deleteItinerary,
        reports,
        addReport,
        upvoteReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
