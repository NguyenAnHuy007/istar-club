/**
 * Utility for cross-tab and cross-window real-time synchronization
 * for interview updates, candidate additions, and status changes.
 */

export const INTERVIEW_BROADCAST_CHANNEL = "istar_interview_updates";

export type BroadcastEventType =
  | "INTERVIEW_UPDATED"
  | "APPLICATION_CREATED"
  | "APPLICATION_UPDATED"
  | "APPLICATION_DELETED";

export interface BroadcastMessage {
  type: BroadcastEventType | string;
  payload?: unknown;
}

/**
 * Notifies the opener window and same-origin tabs via BroadcastChannel.
 */
export function notifyOpener(type: BroadcastEventType | string, payload?: unknown) {
  if (typeof window === "undefined") return;

  try {
    if (window.opener) {
      window.opener.postMessage({ type, payload }, "*");
    }

    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel(INTERVIEW_BROADCAST_CHANNEL);
      bc.postMessage({ type, payload });
      bc.close();
    }
  } catch {
    // Ignore cross-origin or closed window errors silently
  }
}

/**
 * Subscribes to interview broadcast events in current tab.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToBroadcast(
  onMessage: (message: BroadcastMessage) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let bc: BroadcastChannel | null = null;

  if (typeof BroadcastChannel !== "undefined") {
    try {
      bc = new BroadcastChannel(INTERVIEW_BROADCAST_CHANNEL);
      bc.onmessage = (event) => {
        if (event.data) {
          onMessage(event.data);
        }
      };
    } catch {
      // BroadcastChannel might be restricted in some environments
    }
  }

  const handleWindowMessage = (event: MessageEvent) => {
    if (event.data && typeof event.data === "object" && "type" in event.data) {
      onMessage(event.data as BroadcastMessage);
    }
  };

  window.addEventListener("message", handleWindowMessage);

  return () => {
    if (bc) {
      bc.close();
    }
    window.removeEventListener("message", handleWindowMessage);
  };
}
