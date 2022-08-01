import { useUser } from "@supabase/supabase-auth-helpers/react";
import { useEffect } from "react";
import { UserDetails } from "../types";
import { supabase } from "../utils/supabase-client";

const Playground = () => {
  useEffect(() => {
    supabase
      .from<UserDetails>("users")
      .select("*")
      .single()
      .then((res) => {
        console.log("result:", res.data);
      });
  }, []);

  const user = useUser();

  return <pre>{JSON.stringify(user, null, 2)}</pre>;
};

export default Playground;
