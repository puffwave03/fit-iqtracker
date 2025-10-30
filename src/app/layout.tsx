import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "FitIQtracker",
  description: "App fitness intelligente per monitorare nutrizione, allenamenti e progressi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-slate-950 text-white min-h-screen pb-20">
        <header className="p-4 text-center text-lime-400 font-bold text-2xl">
          FitIQtracker 💪
        </header>
        <main>{children}</main>
        <Navbar />
      </body>
    </html>
  );
}
