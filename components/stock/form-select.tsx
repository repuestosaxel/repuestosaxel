import { cn } from "@/lib/utils";

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function FormSelect({ className, children, ...props }: FormSelectProps) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white focus-visible:border-racing-red/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-racing-red/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FormSelectOption({
  children,
  ...props
}: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return (
    <option className="bg-[#0b0b0b]" {...props}>
      {children}
    </option>
  );
}
