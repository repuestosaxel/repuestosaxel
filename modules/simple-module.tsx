import { EmptyState } from "@/components/dashboard/empty-state";
import { ModuleShell } from "@/components/dashboard/module-shell";

type SimpleModuleProps = {
  type: "reportes" | "configuracion";
};

export function SimpleModule({ type }: SimpleModuleProps) {
  const content =
    type === "reportes"
      ? {
          eyebrow: "Analytics",
          title: "Reportes avanzados",
          description: "Espacio preparado para informes exportables, rankings, márgenes por categoría y proyección de compras.",
          emptyTitle: "Reportes listos para conectar",
          emptyDescription:
            "En la versión productiva este módulo puede incluir PDFs, filtros por fecha, comparativas y exportación a Excel.",
          action: "Diseñar reporte"
        }
      : {
          eyebrow: "Sistema",
          title: "Configuración",
          description: "Panel de parámetros para usuarios, permisos, sucursales, impuestos, impresoras y reglas comerciales.",
          emptyTitle: "Configuración preparada",
          emptyDescription:
            "La demo deja planteada la arquitectura visual para crecer hacia roles, permisos y preferencias reales.",
          action: "Agregar ajuste"
        };

  return (
    <ModuleShell eyebrow={content.eyebrow} title={content.title} description={content.description}>
      <EmptyState title={content.emptyTitle} description={content.emptyDescription} action={content.action} />
    </ModuleShell>
  );
}
