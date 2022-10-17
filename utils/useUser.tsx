import { SupabaseClient } from "@supabase/supabase-auth-helpers/nextjs";
import {
  User,
  useUser as useSupaUser,
} from "@supabase/supabase-auth-helpers/react";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { Subscription, UserDetails } from "../types";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  supabaseClient: SupabaseClient;
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const { supabaseClient: supabase } = props;
  const { user, accessToken, isLoading: isLoadingUser } = useSupaUser();

  const { data: subscription, isLoading: subscriptionIsLoading } = useQuery(
    ["subscription"],
    () =>
      new Promise<Subscription>((resolve, reject) =>
        supabase
          .from<Subscription>("subscriptions")
          .select("*, prices(*, products(*))")
          .in("status", ["trialing", "active"])
          .single()
          .then((res) => {
            if (res.error) {
              reject(res.error);
            } else {
              resolve(res.data);
            }
          })
      ),
    {
      enabled: !isLoadingUser && !!user,
    }
  );

  const { data: userDetails, isLoading: userDetailsIsLoading } = useQuery(
    ["user"],
    () =>
      new Promise<UserDetails>((resolve, reject) =>
        supabase
          .from<UserDetails>("users")
          .select("*")
          .single()
          .then((res) => {
            if (res.error) {
              reject(res.error);
            } else {
              resolve(res.data);
            }
          })
      ),
    {
      enabled: !isLoadingUser && !!user,
    }
  );

  console.log({
    subscriptionIsLoading,
    userDetailsIsLoading,
    isLoadingUser,
  });

  const value = {
    accessToken,
    user,
    isLoading:
      (subscriptionIsLoading || userDetailsIsLoading || isLoadingUser) &&
      !isLoadingUser &&
      !!user,
    userDetails: userDetails ?? null,
    subscription: subscription ?? null,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};
