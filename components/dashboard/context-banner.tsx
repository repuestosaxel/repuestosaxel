"use client";

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ContextBannerProps = {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  label?: string;
};

export function ContextBanner({
  loading,
  error,
  onRetry,
  label = "datos"
}: ContextBannerProps) {
  if (loading) {
    return (
      <Card className="flex items-center gap-3 border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/58">
        <Loader2 className="size-4 shrink-0 animate-spin text-racing-red" />
        Cargando {label}...
      </Card>
    );
  }

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
