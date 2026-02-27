"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import type { WSEvent } from "@/types/ws-events";

interface SocketContextType {
  onlineUsers: string[];
  onlineCount: number;
}

const SocketContext = createContext<SocketContextType>({
  onlineUsers: [],
  onlineCount: 0,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [_socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || "3002";
    const s = io(`http://localhost:${wsPort}`, {
      transports: ["websocket"],
      autoConnect: true,
    });

    s.on("connect", () => {
      s.emit("auth", {
        userId: session.user.id,
        username: session.user.username,
      });
    });

    s.on("message", (data: string) => {
      try {
        const event: WSEvent = JSON.parse(data);
        handleWSEvent(event);
      } catch {
        // Ignore malformed messages
      }
    });

    setSocket(s);

    function handleWSEvent(event: WSEvent) {
      switch (event.type) {
        case "user:connected":
        case "user:disconnected":
          setOnlineUsers(event.users);
          break;

        case "item:created":
          queryClient.invalidateQueries({ queryKey: ["items"] });
          toast.success(`${event.by} created "${event.item.customName}"`);
          break;

        case "item:updated":
          queryClient.invalidateQueries({ queryKey: ["items"] });
          queryClient.invalidateQueries({ queryKey: ["item", event.item.id] });
          toast.info(`${event.by} updated "${event.item.customName}"`);
          break;

        case "item:deleted":
          queryClient.invalidateQueries({ queryKey: ["items"] });
          toast.info(`${event.by} deleted an item`);
          break;

        case "items:cleared":
          queryClient.invalidateQueries({ queryKey: ["items"] });
          toast.info(`${event.by} cleared all items`);
          break;

        case "items:synced":
          queryClient.invalidateQueries({ queryKey: ["items"] });
          toast.info(`${event.by} imported items`);
          break;

        case "balance:updated":
          queryClient.invalidateQueries({ queryKey: ["balance"] });
          toast.info(`${event.by} updated balance config`);
          break;

        case "comment:created":
          queryClient.invalidateQueries({ queryKey: ["comments", event.itemId] });
          queryClient.invalidateQueries({ queryKey: ["comment-counts"] });
          break;

        case "history:new":
          queryClient.invalidateQueries({ queryKey: ["history"] });
          break;
      }
    }

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [session?.user, queryClient]);

  return (
    <SocketContext.Provider value={{ onlineUsers, onlineCount: onlineUsers.length }}>
      {children}
    </SocketContext.Provider>
  );
}
