"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ContextBannerProps = {
  error: string | null;
  onRetry?: () => void;
};

export function ContextBanner({ error, onRetry }: ContextBannerProps) {
  if (!error) return null;

  return (
    <Card className="flex flex-col gap-3 border-red-500/30 bg-red-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 text-sm text-red-100">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <p>{error}</p>
      </div>
      {onRetry ? (
        <Button type="button" size="sm" variant="secondary" onClick={() => void onRetry()}>
          <RefreshCw className="size-3.5" />
          Reintentar
        </Button>
      ) : null}
    </Card>
  );
}
