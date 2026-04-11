"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Library", href: "/" },
  { label: "Add New", href: "/books/new" },
  { label: "Pricing", href: "/subscriptions" },
];

const Navbar = () => {
  const pathName = usePathname();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathName]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="w-full fixed z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href="/" className="flex gap-0.5 items-center">
          <Image src="/assets/logo.png" alt="Bookfied" width={42} height={26} />
          <span className="logo-text">Bookified</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));

            return (
              <Link
                href={href}
                key={label}
                className={cn(
                  "nav-link-base",
                  isActive ? "nav-link-active" : "text-black hover:opacity-70",
                )}
              >
                {label}
              </Link>
            );
          })}

          <div className="flex gap-3 items-center">
            <Show when="signed-out">
              <SignInButton>
                <button className="nav-link-base hover:opacity-70">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div className="nav-user-link">
                <UserButton />
                {user?.firstName && (
                  <Link href="/subscriptions" className="nav-user-name">
                    {user.firstName}
                  </Link>
                )}
              </div>
            </Show>
          </div>
        </nav>

        {/* Mobile: auth + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative z-[60] flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={cn(
                "block h-0.5 w-6 bg-black rounded transition-all duration-300",
                menuOpen && "translate-y-2 rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-6 bg-black rounded transition-all duration-300",
                menuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-6 bg-black rounded transition-all duration-300",
                menuOpen && "-translate-y-2 -rotate-45",
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 top-[var(--navbar-height)] bg-(--bg-primary) z-40 flex flex-col md:hidden transition-all duration-300",
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none",
        )}
      >
        <nav className="flex flex-col gap-2 px-5 pt-6">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));

            return (
              <Link
                href={href}
                key={label}
                className={cn(
                  "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
                  isActive
                    ? "text-[var(--color-brand)] bg-[var(--color-brand)]/10"
                    : "text-black hover:bg-black/5",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 mt-6">
          <Show when="signed-out">
            <SignInButton>
              <button className="w-full py-3 text-lg font-medium text-center rounded-lg bg-black text-white hover:opacity-90 transition-opacity">
                Sign In
              </button>
            </SignInButton>
          </Show>
          {/* <Show when="signed-in">
            <div className="flex items-center gap-3 py-2 px-4">
              <UserButton />
              {user?.firstName && (
                <Link
                  href="/subscriptions"
                  className="text-lg font-medium text-black hover:opacity-70 transition-opacity"
                >
                  {user.firstName}
                </Link>
              )}
            </div>
          </Show> */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
