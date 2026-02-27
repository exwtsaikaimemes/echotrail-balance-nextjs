"use client";

import { useMemo, useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { generateKotlinCode } from "@/lib/kotlin-codegen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clipboard } from "lucide-react";

const KEYWORDS = new Set([
  "package", "import", "object", "class", "val", "var", "fun",
  "override", "true", "false", "to", "listOf", "mapOf",
]);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Single-pass Kotlin syntax highlighter.
 * Scans the source left-to-right, classifying each token before emitting HTML.
 * Because no regex ever sees previously-emitted HTML, the "class" keyword
 * corruption bug is structurally impossible.
 */
function highlightKotlin(code: string): string {
  const out: string[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    // --- String literal: "..." with escaped quotes ---
    if (code[i] === '"') {
      let j = i + 1;
      while (j < len && code[j] !== '"') {
        if (code[j] === '\\') j++; // skip escaped char
        j++;
      }
      if (j < len) j++; // include closing quote
      out.push(`<span class="syntax-string">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    // --- Line comment: // to end of line ---
    if (code[i] === '/' && i + 1 < len && code[i + 1] === '/') {
      let j = i + 2;
      while (j < len && code[j] !== '\n') j++;
      out.push(`<span class="syntax-comment">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    // --- Number literal ---
    if (
      code[i] >= '0' && code[i] <= '9' &&
      (i === 0 || !/[a-zA-Z_]/.test(code[i - 1]))
    ) {
      let j = i;
      while (j < len && code[j] >= '0' && code[j] <= '9') j++;
      if (j < len && code[j] === '.') {
        j++;
        while (j < len && code[j] >= '0' && code[j] <= '9') j++;
      }
      out.push(`<span class="syntax-number">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    // --- Identifier / keyword ---
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < len && /[\w]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (KEYWORDS.has(word)) {
        out.push(`<span class="syntax-keyword">${escapeHtml(word)}</span>`);
      } else if (/^[A-Z][a-zA-Z]+$/.test(word)) {
        out.push(`<span class="syntax-type">${escapeHtml(word)}</span>`);
      } else {
        out.push(escapeHtml(word));
      }
      i = j;
      continue;
    }

    // --- Any other character ---
    out.push(escapeHtml(code[i]));
    i++;
  }

  return out.join("");
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
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto rounded-lg bg-[#0d1117]">
          <pre className="p-4">
            <code
              className="text-xs font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
