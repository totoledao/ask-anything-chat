import { LucideProps } from "lucide-react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  variant?: "orange" | "zinc";
}

export function Button({
  text,
  Icon,
  variant = "orange",
  ...props
}: ButtonProps) {
  function style() {
    if (variant === "orange") {
      return "bg-orange-400 text-orange-950 hover:bg-orange-500";
    } else {
      return "bg-zinc-800 text-zinc-300 hover:bg-zinc-700";
    }
  }

  return (
    <button
      className={`min-w-[84px] px-3 py-2 gap-2 flex justify-between items-center rounded-lg font-medium text-sm transition-colors ${style()}`}
      {...props}
    >
      {text} {<Icon className="size-4" />}
    </button>
  );
}
