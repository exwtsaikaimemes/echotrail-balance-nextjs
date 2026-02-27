import Link from "next/link";
import { BookOpen, FileText } from "lucide-react";

const articles = [
  {
    slug: "attribute-guide",
    title: "Attribute Guide",
    description:
      "Comprehensive guide to all item attributes in EchoTrail dungeons. Covers damage formulas, offensive and defensive attributes, utility abilities, set bonuses, and cooldown timings.",
    icon: BookOpen,
  },
  {
    slug: "attribute-reference",
    title: "Attribute Reference",
    description:
      "Technical reference for every attribute bound in the item creator. Includes type, multiplier, suffix, and detailed descriptions for each rollable parameter.",
    icon: FileText,
  },
];

export default function WikiPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wiki</h1>
        <p className="text-sm text-muted-foreground">
          Documentation and reference materials for the EchoTrail item system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((article) => {
          const Icon = article.icon;
          return (
            <Link
              key={article.slug}
              href={`/wiki/${article.slug}`}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/40 hover:border-accent"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-2 shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {article.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
