import { PropsWithChildren, ReactNode } from "react";

interface RenderViewProps {
  when?: boolean;
  fallback?: [boolean, ReactNode];
}

export default function RenderView({ children, when, fallback }: PropsWithChildren<RenderViewProps>) {
  if (fallback && fallback[0]) return fallback[1];
  if (when || fallback) return children;
  return null;
}
