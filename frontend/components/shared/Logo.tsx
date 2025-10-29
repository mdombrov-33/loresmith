interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export default function Logo({ size = "md", showTagline = false }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl md:text-5xl",
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`font-heading ${sizeClasses[size]} font-bold tracking-tight`}>
        <span className="text-primary">Lore</span>
        <span className="text-foreground">Smith</span>
      </div>
      {showTagline && (
        <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wider">
          FORGE YOUR LEGEND
        </p>
      )}
    </div>
  );
}
