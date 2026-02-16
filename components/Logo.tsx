import { Box } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-base" },
    md: { icon: 24, text: "text-xl" },
    lg: { icon: 32, text: "text-2xl" }
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center font-bold">
        {/* Roo - White */}
        <span className="text-white" style={{ color: "#FFFFFF" }}>
          Roo
        </span>
        {/* me - Orange */}
        <span className="text-orange-500" style={{ color: "#FF6B35" }}>
          me
        </span>
        {/* .brnd - Black */}
        <span className="text-black" style={{ color: "#000000" }}>
          .brnd
        </span>
      </div>
    </div>
  );
}
