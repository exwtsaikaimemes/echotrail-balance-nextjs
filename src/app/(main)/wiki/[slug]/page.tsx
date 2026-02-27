import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { MarkdownRenderer } from "@/components/wiki/markdown-renderer";
import { ArrowLeft } from "lucide-react";

const SLUG_TO_FILE: Record<string, string> = {
  "attribute-guide": "ATTRIBUTE_GUIDE.md",
  "attribute-reference": "ATTRIBUTE_REFERENCE.md",
};

const SLUG_TO_TITLE: Record<string, string> = {
  "attribute-guide": "Attribute Guide",
  "attribute-reference": "Attribute Reference",
};

interface WikiArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(SLUG_TO_FILE).map((slug) => ({ slug }));
}

export default async function WikiArticlePage({ params }: WikiArticlePageProps) {
  const { slug } = await params;
  const fileName = SLUG_TO_FILE[slug];
  if (!fileName) {
    notFound();
  }

  const filePath = path.join(process.cwd(), "docs", fileName);

  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  const title = SLUG_TO_TITLE[slug] ?? slug;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/wiki"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Wiki
        </Link>
      </div>

      <MarkdownRenderer content={content} />
    </div>
  );
}
