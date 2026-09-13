"use client";

import { LocaleLink as NextLink } from "../components/LocaleLink";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useColorMode } from "../hooks/use-color-mode";
import { useLanguage } from "../utils/use-language";
import { useSubscription } from "../utils/useSubscription";
import { useUser } from "../utils/useUser";
import { SubscriptionType } from "../types";
import { languageMap } from "../utils/translate";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Translated on the server and handed down, because the nav renders on every
 * page: doing it here with <T> meant every indexed page shipped an English nav
 * and swapped it after hydration.
 */
export interface NavLabels {
  language: string;
  help: string;
  news: string;
  pricing: string;
  account: string;
  signOut: string;
  signIn: string;
  createChordDiagram: string;
}

const Logo: React.FunctionComponent = () => {
  const subscription = useSubscription();

  return (
    <NextLink href="/" className="flex items-center gap-3 text-xl">
      <svg viewBox="0 0 100 100" className="h-7 w-7 fill-foreground">
        <circle r={50} cx={50} cy={50} />
      </svg>
      <span className="font-heading font-semibold tracking-tight">
        ChordPic
      </span>
      {subscription === SubscriptionType.PRO && (
        <Badge variant="secondary">PRO</Badge>
      )}
    </NextLink>
  );
};

const NavbarMenuItem: React.FunctionComponent<
  PropsWithChildren<{ to: string; onNavigate(): void }>
> = ({ children, onNavigate, to }) => (
  <NextLink
    href={to}
    onClick={onNavigate}
    className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
  >
    {children}
  </NextLink>
);

const ColorModeToggle: React.FunctionComponent = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleColorMode}
      aria-label="Toggle dark mode"
    >
      {colorMode === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
};

const MenuLinks: React.FunctionComponent<{
  onCloseMenu(): void;
  labels: NavLabels;
}> = ({ onCloseMenu, labels }) => {
  const { user } = useUser();
  const pathname = usePathname();
  const subscription = useSubscription();
  const language = useLanguage();

  return (
    <>
      <NavbarMenuItem onNavigate={onCloseMenu} to="/languages">
        {labels.language} {languageMap[language]?.icon}
      </NavbarMenuItem>
      <NavbarMenuItem onNavigate={onCloseMenu} to="/help">
        {labels.help}
      </NavbarMenuItem>
      <NavbarMenuItem onNavigate={onCloseMenu} to="/news">
        {labels.news}
      </NavbarMenuItem>
      {subscription === SubscriptionType.FREE && (
        <NavbarMenuItem onNavigate={onCloseMenu} to="/pricing">
          {labels.pricing}
        </NavbarMenuItem>
      )}
      {user ? (
        <>
          <NavbarMenuItem onNavigate={onCloseMenu} to="/account">
            {labels.account}
          </NavbarMenuItem>
          <NavbarMenuItem onNavigate={onCloseMenu} to="/auth/logout">
            {labels.signOut}
          </NavbarMenuItem>
        </>
      ) : (
        <NavbarMenuItem to="/signin" onNavigate={onCloseMenu}>
          {labels.signIn}
        </NavbarMenuItem>
      )}
      {pathname !== "/" && (
        <NextLink
          href="/"
          onClick={onCloseMenu}
          className={cn(buttonVariants(), "text-base")}
        >
          {labels.createChordDiagram}
        </NextLink>
      )}
    </>
  );
};

export const NavBar = ({ labels }: { labels: NavLabels }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-6 md:flex">
          <MenuLinks onCloseMenu={() => setIsOpen(false)} labels={labels} />
          <ColorModeToggle />
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <ColorModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>
      {isOpen && (
        <div className="border-t px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col items-start gap-4">
            <MenuLinks onCloseMenu={() => setIsOpen(false)} labels={labels} />
          </div>
        </div>
      )}
    </header>
  );
};
