"use client";

import { useSocket } from "@/components/providers/socket-provider";

export function OnlineBadge() {
  const { onlineUsers, onlineCount } = useSocket();

  return (
    <div className="relative group">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-default">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span>{onlineCount} online</span>
      </div>

      {onlineUsers.length > 0 && (
        <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover:block">
          <div className="bg-popover border border-border rounded-md shadow-md p-2 min-w-[120px]">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Online Users</p>
            {onlineUsers.map((user) => (
              <p key={user} className="text-sm py-0.5">
                {user}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
