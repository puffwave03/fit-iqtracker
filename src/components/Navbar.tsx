"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  const links = [
    { href: "/dashboard", label: "🏠 Dashboard" },
    { href: "/nutrition", label: "🍎 Nutrizione" },
    { href: "/workouts", label: "💪 Allenamenti" },
    { href: "/progress", label: "📊 Progressi" },
    { href: "/journal", label: "📓 Diario" },
    { href: "/settings", label: "⚙️ Impostazioni" },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-700 flex justify-around py-3 z-50">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-semibold transition ${
            path === href ? "text-lime-400" : "text-gray-400 hover:text-lime-300"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
