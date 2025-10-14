import "./globals.css";
import Navigation from "@/components/Navigation";
import { AppProvider } from "@/contexts/AppContext";

export const metadata = {
  title: "Legal Document Review - Exercise 8",
  description: "HITL Contract Redlining Orchestrator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
