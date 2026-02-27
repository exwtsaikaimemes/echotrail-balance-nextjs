"use client";

import { useSession } from "next-auth/react";
import { useBalanceConfig } from "@/hooks/use-balance";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WeightsTable } from "@/components/config/weights-table";
import { AllowancesGrid } from "@/components/config/allowances-grid";
import { FormulaSelector } from "@/components/config/formula-selector";
import { AttributeDefsTable } from "@/components/config/attribute-defs-table";
import { ConfigImportExport } from "@/components/config/config-import-export";
import { Settings, Scale, Grid3X3, FunctionSquare, BookOpen } from "lucide-react";

export default function ConfigPage() {
  const { data: session } = useSession();
  const { data: balanceConfig, isLoading } = useBalanceConfig();

  const isAdmin = (session?.user as any)?.role === "admin";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-10 w-[500px]" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!balanceConfig) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h2 className="text-lg font-semibold">No balance configuration found</h2>
        <p className="text-sm text-muted-foreground">
          The balance configuration could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Settings className="h-6 w-6" />
            Balance Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage attribute weights, budget allowances, cost formula, and attribute definitions.
          </p>
        </div>
        <ConfigImportExport balanceConfig={balanceConfig} isAdmin={isAdmin} />
      </div>

      <Tabs defaultValue="weights" className="space-y-4">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4">
          <TabsTrigger value="weights" className="flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            Weights
          </TabsTrigger>
          <TabsTrigger value="allowances" className="flex items-center gap-1.5">
            <Grid3X3 className="h-3.5 w-3.5" />
            Allowances
          </TabsTrigger>
          <TabsTrigger value="formula" className="flex items-center gap-1.5">
            <FunctionSquare className="h-3.5 w-3.5" />
            Formula
          </TabsTrigger>
          <TabsTrigger value="defs" className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Attribute Defs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weights">
          <WeightsTable
            weights={balanceConfig.weights}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="allowances">
          <AllowancesGrid
            allowances={balanceConfig.allowances}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="formula">
          <FormulaSelector
            formula={balanceConfig.formula}
          />
        </TabsContent>

        <TabsContent value="defs">
          <AttributeDefsTable
            attributeDefs={balanceConfig.attributeDefs}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
