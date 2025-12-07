import { useState, useEffect } from "react";
import { Wifi, WifiOff, Download, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface OfflineIndicatorProps {
  showCacheStatus?: boolean;
}

const OfflineIndicator = ({ showCacheStatus = false }: OfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedResources, setCachedResources] = useState<string[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online!", {
        description: "All features are now available.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline", {
        description: "Some features may be limited. Emergency contacts are still accessible.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check cached resources
    if ("caches" in window) {
      caches.keys().then((names) => {
        setCachedResources(names);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cache important resources for offline access
  useEffect(() => {
    const cacheResources = async () => {
      if ("caches" in window && "serviceWorker" in navigator) {
        try {
          const cache = await caches.open("hera-emergency-v1");
          
          // Cache emergency page content
          const emergencyData = {
            contacts: [
              { name: "Kenya Emergency", number: "999" },
              { name: "Kenya Emergency (Alt)", number: "112" },
              { name: "Gender Violence Hotline", number: "0800 720 990" },
              { name: "COVAW Kenya", number: "+254 800 720 553" },
              { name: "FIDA Kenya", number: "+254 20 387 4938" },
              { name: "Kenya Red Cross", number: "1199" },
            ],
            cached_at: new Date().toISOString(),
          };

          // Store emergency data in localStorage for offline access
          localStorage.setItem("hera_emergency_data", JSON.stringify(emergencyData));
        } catch (error) {
          console.error("Failed to cache resources:", error);
        }
      }
    };

    cacheResources();
  }, []);

  if (isOnline && !showCacheStatus) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
      <Badge
        variant={isOnline ? "outline" : "destructive"}
        className={`gap-2 px-3 py-1.5 shadow-lg ${
          isOnline ? "bg-background" : "animate-pulse"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Online
            {showCacheStatus && cachedResources.length > 0 && (
              <span className="flex items-center gap-1 ml-2 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Cached
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            Offline Mode
          </>
        )}
      </Badge>
    </div>
  );
};

// Emergency contacts component that works offline
export const OfflineEmergencyContacts = () => {
  const [contacts, setContacts] = useState<{ name: string; number: string }[]>([]);

  useEffect(() => {
    // Try to get cached emergency data
    const cachedData = localStorage.getItem("hera_emergency_data");
    if (cachedData) {
      const data = JSON.parse(cachedData);
      setContacts(data.contacts);
    } else {
      // Fallback hardcoded contacts
      setContacts([
        { name: "Kenya Emergency", number: "999" },
        { name: "Kenya Emergency (Alt)", number: "112" },
        { name: "Gender Violence Hotline", number: "0800 720 990" },
        { name: "COVAW Kenya", number: "+254 800 720 553" },
        { name: "Kenya Red Cross", number: "1199" },
      ]);
    }
  }, []);

  return (
    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <Download className="h-4 w-4" />
        Emergency Contacts (Available Offline)
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {contacts.map((contact, index) => (
          <a
            key={index}
            href={`tel:${contact.number}`}
            className="p-2 bg-background rounded-lg text-center hover:bg-muted transition-colors"
          >
            <p className="text-xs text-muted-foreground">{contact.name}</p>
            <p className="font-bold text-primary">{contact.number}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default OfflineIndicator;
