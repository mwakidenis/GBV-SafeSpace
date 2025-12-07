import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SOSButtonProps {
  onActivate: () => void;
}

export const SOSButton = ({ onActivate }: SOSButtonProps) => {
  const [pressing, setPressing] = useState(false);
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

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
              // Vibrate if supported
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }
              onActivate();
              shakeCount = 0;
            }
            
            // Clear existing timer and set new one
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
  }, [onActivate]);

  useEffect(() => {
    if (!shakeEnabled) return;

    const motionHandler = handleShake();

    // Request permission for iOS 13+
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
        // Non-iOS devices
        window.addEventListener("devicemotion", motionHandler);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("devicemotion", motionHandler);
    };
  }, [shakeEnabled, handleShake]);

  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onActivate();
      setCountdown(null);
      setPressing(false);
      // Vibrate on activation
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [countdown, onActivate]);

  const handlePressStart = () => {
    setPressing(true);
    setCountdown(2); // 2 second countdown
    toast.info("Hold to activate SOS mode...", {
      duration: 2000,
    });
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setPressing(false);
    setCountdown(null);
  };

  const toggleShakeMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShakeEnabled(!shakeEnabled);
    toast.info(shakeEnabled ? "Shake-to-SOS disabled" : "Shake-to-SOS enabled", {
      description: shakeEnabled 
        ? "Shake detection is now off" 
        : "Shake your phone 3 times quickly to activate SOS",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Shake indicator */}
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-full w-8 h-8 p-0 ${
          shakeEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"
        }`}
        onClick={toggleShakeMode}
        title={shakeEnabled ? "Shake-to-SOS enabled" : "Shake-to-SOS disabled"}
      >
        <Vibrate className="h-4 w-4" />
      </Button>

      {/* Main SOS Button */}
      <Button
        variant="destructive"
        size="lg"
        className={`rounded-full w-16 h-16 shadow-strong transition-all relative ${
          pressing ? "scale-110 shadow-glow animate-pulse" : "hover:scale-105"
        }`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        title="Hold for 2 seconds to activate SOS mode"
      >
        {countdown !== null ? (
          <span className="text-2xl font-bold">{countdown}</span>
        ) : (
          <AlertTriangle className="h-8 w-8" />
        )}
        
        {/* Progress ring during countdown */}
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
    </div>
  );
};
