"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrentLoadout } from "@/hooks/use-loadout";
import { useItems } from "@/hooks/use-items";
import { computeLoadoutStats } from "@/lib/loadout-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface WindowState {
  open: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
}

const STORAGE_KEY = "loadout-stats-window";
const DEFAULT_STATE: WindowState = {
  open: true,
  x: 20,
  y: 100,
  width: 400,
  height: 300,
  minimized: false,
};

export default function FloatingLoadoutStats() {
  const [windowState, setWindowState] = useState<WindowState>(DEFAULT_STATE);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: currentLoadout } = useCurrentLoadout();
  const { data: allItems } = useItems();

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWindowState(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors, use default
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(windowState));
  }, [windowState]);

  const handleClose = () => {
    setWindowState((prev) => ({ ...prev, open: false }));
  };

  const handleToggleMinimize = () => {
    setWindowState((prev) => ({ ...prev, minimized: !prev.minimized }));
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - windowState.x, y: e.clientY - windowState.y });
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setWindowState((prev) => ({
          ...prev,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        }));
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setWindowState((prev) => ({
          ...prev,
          width: Math.max(300, prev.width + deltaX),
          height: Math.max(200, prev.height + deltaY),
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart]);

  if (!windowState.open) {
    return null;
  }

  // Get equipped items and compute stats
  const equippedItems = currentLoadout && allItems
    ? Object.values(currentLoadout)
        .filter((itemKey): itemKey is string => itemKey !== null)
        .map((itemKey) => allItems.find((item) => item.itemKey === itemKey))
        .filter((item): item is NonNullable<typeof allItems[0]> => item !== undefined)
    : [];

  const stats = equippedItems.length > 0 ? computeLoadoutStats(equippedItems) : [];
  stats.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      ref={containerRef}
      className="fixed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-40"
      style={{
        left: `${windowState.x}px`,
        top: `${windowState.y}px`,
        width: `${windowState.width}px`,
        height: windowState.minimized ? "auto" : `${windowState.height}px`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 cursor-move"
        onMouseDown={handleMouseDownDrag}
      >
        <h3 className="font-semibold text-sm">Loadout Stats</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleMinimize}
            className="h-6 w-6 p-0"
          >
            {windowState.minimized ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClose} className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      {!windowState.minimized && (
        <div className="flex-1 overflow-auto p-2">
          {stats.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-4">
              No stats to display
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-6">Stat</TableHead>
                  <TableHead className="text-right h-6 w-16">Min</TableHead>
                  <TableHead className="text-right h-6 w-16">Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.name} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell className="py-1 truncate">{stat.name}</TableCell>
                    <TableCell className="py-1 text-right">
                      {stat.totalMin.toFixed(1)}
                    </TableCell>
                    <TableCell className="py-1 text-right">
                      {stat.totalMax.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Resize handle */}
      {!windowState.minimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 bg-slate-300 dark:bg-slate-600 rounded-tl"
          onMouseDown={handleMouseDownResize}
          style={{ touchAction: "none" }}
        />
      )}
    </div>
  );
}
