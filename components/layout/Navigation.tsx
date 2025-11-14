"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMaxTheme } from "@/lib/max";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Главная", icon: "🏠" },
  { href: "/profile", label: "Профиль", icon: "👤" },
  { href: "/features", label: "Возможности", icon: "⚡" },
];

export function Navigation(): React.ReactElement {
  const pathname = usePathname();
  const { colorScheme } = useMaxTheme();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t"
      style={{
        backgroundColor: colorScheme.bg_color ?? "#ffffff",
        borderColor: colorScheme.secondary_bg_color ?? "#e5e5e5",
      }}
    >
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? "opacity-100" : "opacity-60"
                }`}
                style={{
                  color: isActive
                    ? colorScheme.button_color ?? "#3390ec"
                    : colorScheme.text_color ?? "#000000",
                }}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

