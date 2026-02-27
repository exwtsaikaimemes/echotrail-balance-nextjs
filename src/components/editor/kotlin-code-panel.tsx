"use client";

import { useMemo, useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { generateKotlinCode } from "@/lib/kotlin-codegen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clipboard } from "lucide-react";

/**
 * Naive Kotlin syntax highlighting using the CSS classes from globals.css.
 * Wraps recognized tokens in <span> elements.
 */
function highlightKotlin(code: string): string {
  const keywords = [
    "package",
    "import",
    "object",
    "class",
    "val",
    "var",
    "fun",
    "override",
    "true",
    "false",
    "to",
    "listOf",
    "mapOf",
  ];

  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Strings
  escaped = escaped.replace(
    /("(?:[^"\\]|\\.)*")/g,
    '<span class="syntax-string">$1</span>'
  );

  // Comments
  escaped = escaped.replace(
    /(\/\/.*)/g,
    '<span class="syntax-comment">$1</span>'
  );

  // Numbers (standalone numeric literals)
  escaped = escaped.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="syntax-number">$1</span>'
  );

  // Keywords
  for (const kw of keywords) {
    const regex = new RegExp(`\\b(${kw})\\b`, "g");
    escaped = escaped.replace(
      regex,
      '<span class="syntax-keyword">$1</span>'
    );
  }

  // Type references (PascalCase words)
  escaped = escaped.replace(
    /\b([A-Z][a-zA-Z]+)\b/g,
    (match, p1) => {
      // Don't double-wrap already-highlighted tokens
      if (match.includes("syntax-")) return match;
      return `<span class="syntax-type">${p1}</span>`;
    }
  );

  return escaped;
}

export function KotlinCodePanel() {
  const { watch } = useFormContext<Item>();
  const watchedItem = watch();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const code = useMemo(() => {
    try {
      return generateKotlinCode(watchedItem);
    } catch {
      return "// Error generating code";
    }
  }, [watchedItem]);

  const highlighted = useMemo(() => highlightKotlin(code), [code]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [code]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg">Kotlin Code</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="mr-1 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px] w-full">
          <pre className="rounded-lg bg-[#0d1117] p-4 overflow-x-auto">
            <code
              className="text-xs font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
