
import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <div className="flex-1">
        {children}
      </div>
      <Navigation />
    </div>
  );
}
