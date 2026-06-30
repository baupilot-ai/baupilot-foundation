import { HardHat } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "h-8 w-8", icon: "h-4 w-4", text: "text-sm" },
    md: { box: "h-9 w-9", icon: "h-5 w-5", text: "text-base" },
    lg: { box: "h-11 w-11", icon: "h-6 w-6", text: "text-lg" },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${s.box} grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm`}
      >
        <HardHat className={s.icon} strokeWidth={2.25} />
      </div>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className={`${s.text} font-bold tracking-tight text-foreground`}>BauPilot</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          AI
        </span>
      </div>
    </div>
  );
}
