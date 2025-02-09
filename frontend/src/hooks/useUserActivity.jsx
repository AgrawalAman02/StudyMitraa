import { useState, useEffect } from "react";
import { toast } from "sonner";

const DEFAULT_IDLE_TIMEOUT = 30 * 1000; // 30 seconds

function useUserActivity(idleTimeout = DEFAULT_IDLE_TIMEOUT) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isIdle, setIsIdle] = useState(false);

  // Reset the activity timer on events
  function handleActivity() {
    setLastActivity(Date.now());
    if (isIdle) {
      setIsIdle(false);
      console.log("User is active again");
      toast.error("User is active again");
    }
  }

  useEffect(() => {
    // List of events to detect user activity
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];
    for (const event of events) {
      window.addEventListener(event, handleActivity);
    }

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > idleTimeout) {
        setIsIdle(true);
        console.log("User is idle");
        toast.success("User is idle");
      }
    }, 1000);

    return () => {
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
      clearInterval(interval);
    };
  }, [isIdle, lastActivity, idleTimeout]);

  return { isIdle, lastActivity };
}

export default useUserActivity;