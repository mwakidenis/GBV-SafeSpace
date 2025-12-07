import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Bot, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingActionMenuProps {
  onSOSActivate: () => void;
  onChatOpen?: () => void;
  chatContext?: "support" | "general" | "detect";
}

export const FloatingActionMenu = ({ 
  onSOSActivate, 
  chatContext = "general"
}: FloatingActionMenuProps) => {
  const navigate = useNavigate();
  const [pressing, setPressing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shakeEnabled, setShakeEnabled] = useState(true);

  // Shake detection for mobile devices
  const handleShake = useCallback(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let lastTime = Date.now();
    let shakeCount = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    const SHAKE_THRESHOLD = 15;
    const SHAKE_COUNT_THRESHOLD = 3;
    const SHAKE_TIME_WINDOW = 1000;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastTime;

      if (timeDiff > 100) {
        const x = acceleration.x || 0;
        const y = acceleration.y || 0;
        const z = acceleration.z || 0;

        if (lastX !== null && lastY !== null && lastZ !== null) {
          const deltaX = Math.abs(x - lastX);
          const deltaY = Math.abs(y - lastY);
          const deltaZ = Math.abs(z - lastZ);

          if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
            shakeCount++;
            if (shakeCount >= SHAKE_COUNT_THRESHOLD) {
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }
              onSOSActivate();
              shakeCount = 0;
            }
            
            if (resetTimer) {
              clearTimeout(resetTimer);
            }
            resetTimer = setTimeout(() => {
              shakeCount = 0;
            }, SHAKE_TIME_WINDOW);
          }
        }

        lastX = x;
        lastY = y;
        lastZ = z;
        lastTime = currentTime;
      }
    };

    return handleMotion;
  }, [onSOSActivate]);

  useEffect(() => {
    if (!shakeEnabled) return;

    const motionHandler = handleShake();

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })?.requestPermission === "function") {
        try {
          const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
          if (permission === "granted") {
            window.addEventListener("devicemotion", motionHandler);
          }
        } catch (error) {
          console.log("Motion permission denied");
        }
      } else {
        window.addEventListener("devicemotion", motionHandler);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("devicemotion", motionHandler);
    };
  }, [shakeEnabled, handleShake]);

  // Countdown effect for SOS
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onSOSActivate();
      setCountdown(null);
      setPressing(false);
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [countdown, onSOSActivate]);

  const handleSOSPressStart = () => {
    setPressing(true);
    setCountdown(2);
    toast.info("Hold to activate SOS mode...", { duration: 2000 });
  };

  const handleSOSPressEnd = () => {
    setPressing(false);
    setCountdown(null);
  };

  const toggleShakeMode = () => {
    setShakeEnabled(!shakeEnabled);
    toast.info(shakeEnabled ? "Shake-to-SOS disabled" : "Shake-to-SOS enabled", {
      description: shakeEnabled 
        ? "Shake detection is now off" 
        : "Shake your phone 3 times quickly to activate SOS",
    });
  };

  const handleChatClick = () => {
    navigate(`/hera-chat?context=${chatContext}`);
  };

  const getContextColor = () => {
    switch (chatContext) {
      case "support":
        return "bg-accent hover:bg-accent/90 text-accent-foreground";
      case "detect":
        return "bg-secondary hover:bg-secondary/90 text-secondary-foreground";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Shake Toggle - Small */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full shadow-lg bg-card",
                shakeEnabled ? "border-primary" : "border-muted"
              )}
              onClick={toggleShakeMode}
            >
              <Vibrate className={cn("h-4 w-4", shakeEnabled ? "text-primary" : "text-muted-foreground")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{shakeEnabled ? "Shake SOS: ON" : "Shake SOS: OFF"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Chat Button - Medium */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg",
                getContextColor()
              )}
              onClick={handleChatClick}
            >
              <Bot className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Chat with HERA AI</p>
          </TooltipContent>
        </Tooltip>

        {/* SOS Button - Large */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-xl transition-all relative",
                pressing ? "scale-110 animate-pulse" : "hover:scale-105"
              )}
              onMouseDown={handleSOSPressStart}
              onMouseUp={handleSOSPressEnd}
              onMouseLeave={handleSOSPressEnd}
              onTouchStart={handleSOSPressStart}
              onTouchEnd={handleSOSPressEnd}
            >
              {countdown !== null ? (
                <span className="text-xl font-bold">{countdown}</span>
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
              {pressing && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="283"
                    strokeDashoffset={countdown !== null ? (countdown / 2) * 283 : 283}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Hold 2s for Emergency SOS</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
