"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Subscription, UserDetails } from "../types";
import { createClient } from "./supabase/browser";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

/**
 * Replaces the auth-helpers `UserProvider`. `onAuthStateChange` fires once on
 * subscribe with the restored session, so it doubles as the initial read and
 * there is no separate getSession() race to handle.
 */
export const MyUserContextProvider = ({ children }: PropsWithChildren) => {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoadingUser(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const user = session?.user ?? null;

  const {
    data: subscription,
    isLoading: subscriptionIsLoading,
    isFetching: subscriptionIsFetching,
  } = useQuery(
    ["subscription", user?.id],
    async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, prices(*, products(*))")
        .in("status", ["trialing", "active"])
        .single();

      if (error) {
        throw error;
      }

      return data as Subscription;
    },
    {
      enabled: !isLoadingUser && !!user,
      retry: 0,
    },
  );

  const {
    data: userDetails,
    isLoading: userDetailsIsLoading,
    isFetching: userDetailsIsFetching,
  } = useQuery(
    ["user", user?.id],
    async () => {
      const { data, error } = await supabase.from("users").select("*").single();

      if (error) {
        throw error;
      }

      return data as UserDetails;
    },
    {
      enabled: !isLoadingUser && !!user,
      retry: 0,
    },
  );

  const value = {
    accessToken: session?.access_token ?? null,
    user,
    isLoading:
      (subscriptionIsLoading && subscriptionIsFetching) ||
      (userDetailsIsLoading && userDetailsIsFetching) ||
      isLoadingUser,
    userDetails: userDetails ?? null,
    subscription: subscription ?? null,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};
