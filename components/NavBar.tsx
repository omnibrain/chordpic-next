import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { PropsWithChildren } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { T } from "@magic-translate/react";
import { useColorMode } from "../hooks/use-color-mode";
import { useLanguage } from "../utils/use-language";
import { useSubscription } from "../utils/useSubscription";
import { useUser } from "../utils/useUser";
import { SubscriptionType } from "../types";
import { languageMap } from "../utils/translate";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

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
}> = ({ onCloseMenu }) => {
  const { user } = useUser();
  const { pathname } = useRouter();
  const subscription = useSubscription();
  const language = useLanguage();

  return (
    <>
      <NavbarMenuItem onNavigate={onCloseMenu} to="/languages">
        <T>Language</T> {languageMap[language]?.icon}
      </NavbarMenuItem>
      <NavbarMenuItem onNavigate={onCloseMenu} to="/help">
        <T>Help</T>
      </NavbarMenuItem>
      <NavbarMenuItem onNavigate={onCloseMenu} to="/news">
        <T>News</T>
      </NavbarMenuItem>
      {subscription === SubscriptionType.FREE && (
        <NavbarMenuItem onNavigate={onCloseMenu} to="/pricing">
          <T>Pricing</T>
        </NavbarMenuItem>
      )}
      {user ? (
        <>
          <NavbarMenuItem onNavigate={onCloseMenu} to="/account">
            <T>Account</T>
          </NavbarMenuItem>
          <NavbarMenuItem onNavigate={onCloseMenu} to="/api/auth/logout">
            <T>Sign out</T>
          </NavbarMenuItem>
        </>
      ) : (
        <NavbarMenuItem to="/signin" onNavigate={onCloseMenu}>
          <T>Sign in</T>
        </NavbarMenuItem>
      )}
      {pathname !== "/" && (
        <NextLink
          href="/"
          onClick={onCloseMenu}
          className={buttonVariants({ size: "sm" })}
        >
          <T>Create chord diagram</T>
        </NextLink>
      )}
    </>
  );
};

export const NavBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-6 md:flex">
          <MenuLinks onCloseMenu={() => setIsOpen(false)} />
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
            <MenuLinks onCloseMenu={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
};
