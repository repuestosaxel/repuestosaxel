"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Save, Settings2 } from "lucide-react";

import { ContextBanner } from "@/components/dashboard/context-banner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingProgressStrip, SettingsFormSkeleton } from "@/components/dashboard/data-loading";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { ModalField } from "@/components/stock/product-modal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import type { BusinessSetting } from "@/types/settings";

type SimpleModuleProps = {
  type: "reportes" | "configuracion";
};

export function SimpleModule({ type }: SimpleModuleProps) {
  if (type === "reportes") {
    return (
      <ModuleShell
        eyebrow="Analytics"
        title="Reportes avanzados"
        description="Espacio preparado para informes exportables, rankings, márgenes por categoría y proyección de compras."
      >
        <EmptyState
          title="Reportes listos para conectar"
          description="En la versión productiva este módulo puede incluir PDFs, filtros por fecha, comparativas y exportación a Excel."
          action="Diseñar reporte"
        />
      </ModuleShell>
    );
  }

  return <SettingsPanel />;
}

function SettingsPanel() {
  const [settings, setSettings] = useState<BusinessSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.get<BusinessSetting[]>("/api/settings");
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const updated = await api.patch<BusinessSetting[]>("/api/settings", {
        settings: settings.map(({ key, value, label }) => ({ key, value, label }))
      });
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (key: string, value: string) => {
    setSettings((current) =>
      current.map((setting) => (setting.key === key ? { ...setting, value } : setting))
    );
    setSaved(false);
  };

  const reloadSettings = () => {
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await api.get<BusinessSetting[]>("/api/settings");
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
    })();
  };

  if (loading) {
    return (
      <ModuleShell
        eyebrow="Sistema"
        title="Configuración"
        description="Panel de parámetros comerciales, fiscales y operativos del negocio."
      >
        <div className="space-y-5">
          <LoadingProgressStrip />
          <SettingsFormSkeleton />
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      eyebrow="Sistema"
      title="Configuración"
      description="Panel de parámetros comerciales, fiscales y operativos del negocio."
    >
      <ContextBanner error={error} onRetry={reloadSettings} />

      {settings.length === 0 ? (
        <EmptyState
          title="Sin ajustes configurados"
          description="Ejecutá el seed de desarrollo o creá registros en business_settings desde Supabase."
          action="Ejecutar seed"
        />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="size-5 text-racing-red" />
                Parámetros del negocio
              </CardTitle>
              <Button type="submit" disabled={saving}>
                <Save />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {settings.map((setting) => (
                <ModalField key={setting.key} label={setting.label ?? setting.key}>
                  <Input
                    value={setting.value}
                    onChange={(event) => updateValue(setting.key, event.target.value)}
                  />
                </ModalField>
              ))}
            </CardContent>
          </Card>
        </form>
      )}

      {saved ? (
        <p className="mt-4 text-sm font-medium text-emerald-300">Configuración guardada correctamente.</p>
      ) : null}

    </ModuleShell>
  );
}
