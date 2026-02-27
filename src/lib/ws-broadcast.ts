import type { WSEvent } from "@/types/ws-events";

const WS_PORT = process.env.WS_PORT || "3002";

/**
 * Broadcast an event to connected Socket.io clients via the standalone WS server.
 * API routes call this after mutations to notify other clients.
 */
export async function broadcast(event: WSEvent, excludeUserId?: string): Promise<void> {
  try {
    await fetch(`http://localhost:${WS_PORT}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, excludeUserId }),
    });
  } catch {
    // WS server might not be running — fail silently
    console.warn("WebSocket broadcast failed — WS server may be offline");
  }
}

export async function broadcastToAll(event: WSEvent): Promise<void> {
  return broadcast(event);
}
