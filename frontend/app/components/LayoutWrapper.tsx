"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AppShell from "../components/AppShell";
import Robot from "../components/RobotEmoji";
import { StuckAssistantProvider } from "../providers/stuck-assistance-provider";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideLayout = ["/", "/register", "/forgotpassword"].includes(pathname);

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <StuckAssistantProvider>
        <AppShell>{children}</AppShell>
        <Robot />
      </StuckAssistantProvider>
      <SiteFooter />
    </div>
  );
}