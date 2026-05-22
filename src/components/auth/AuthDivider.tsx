interface AuthDividerProps {
  text?: string;
}

export default function AuthDivider({ text = "or" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground tracking-wide uppercase">
        {text}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
