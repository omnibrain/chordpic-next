import { NextResponse } from "next/server";
import { getURL } from "../../../utils/helpers";
import { stripe } from "../../../utils/stripe";
import { createOrRetrieveCustomer } from "../../../utils/supabase-admin";
import { getUser } from "../../../utils/supabase/server";

export async function POST() {
  try {
    // `withAuthRequired` used to reject the request before the handler ran.
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const customer = await createOrRetrieveCustomer({
      uuid: user.id || "",
      email: user.email || "",
    });

    if (!customer) throw Error("Could not get customer");
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/account`,
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    console.log(err);

    return NextResponse.json(
      { error: { statusCode: 500, message: err.message } },
      { status: 500 },
    );
  }
}
