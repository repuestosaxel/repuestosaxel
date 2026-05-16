import { FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action: string;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-racing-red/30 bg-racing-red/12 text-racing-red">
        <FileSearch className="size-8" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/54">{description}</p>
      <Button className="mt-6">{action}</Button>
    </Card>
  );
}
