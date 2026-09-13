import { createClient } from "@supabase/supabase-js";
import { ProductWithPrice, UserDetails } from "../types";
import { supabaseCredentials } from "./supabase/cookies";
import { createClient as createBrowserClient } from "./supabase/browser";

/**
 * Anonymous, cookie-free client for public reads.
 *
 * Deliberately not the cookie-backed server client: /pricing reads products
 * while it is being prerendered, and touching `cookies()` there would opt the
 * page out of static generation.
 */
function supabasePublic() {
  const { url, anonKey } = supabaseCredentials();

  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export const getActiveProductsWithPrices = async (): Promise<
  ProductWithPrice[]
> => {
  const { data, error } = await supabasePublic()
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { referencedTable: "prices" });

  if (error) {
    console.log(error.message);
    throw error;
  }

  return (data as ProductWithPrice[] | null) || [];
};

export const updateUserName = async (userId: string, name: string) => {
  await createBrowserClient()
    .from("users")
    .update({ full_name: name } satisfies Partial<UserDetails>)
    .eq("id", userId);
};
