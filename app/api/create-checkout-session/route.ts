import { NextResponse, type NextRequest } from "next/server";
import { getURL } from "../../../utils/helpers";
import { stripe } from "../../../utils/stripe";
import { createOrRetrieveCustomer } from "../../../utils/supabase-admin";
import { getUser } from "../../../utils/supabase/server";

export async function POST(request: NextRequest) {
  const {
    price,
    quantity = 1,
    metadata = {},
    referral,
    coupon,
    analyticsClientId,
  } = await request.json();

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

    // Validate the Rewardful coupon against Stripe before applying it, so a
    // stale/invalid coupon id never blocks checkout with a "No such coupon" error.
    let validCoupon: string | undefined;
    if (coupon) {
      try {
        const retrievedCoupon = await stripe.coupons.retrieve(coupon);
        // `retrieve` still returns coupons that exist but are no longer
        // usable (expired or past `max_redemptions`); those come back with
        // `valid: false`. Only apply the coupon when it's actually valid,
        // otherwise Stripe rejects the Checkout Session and blocks checkout.
        if (retrievedCoupon.valid) {
          validCoupon = coupon;
        } else {
          console.log("Invalid Rewardful coupon, ignoring", coupon);
        }
      } catch (err) {
        console.log("Invalid Rewardful coupon, ignoring", err);
      }
    }

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "required",
      customer,
      ...(referral ? { client_reference_id: referral } : {}),
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: "subscription",
      // Stripe rejects Checkout Sessions that set both `discounts` and
      // `allow_promotion_codes`, so only allow manual promo codes when
      // there's no referral coupon to auto-apply.
      ...(validCoupon
        ? { discounts: [{ coupon: validCoupon }] }
        : { allow_promotion_codes: true }),
      subscription_data: {
        trial_from_plan: true,
        metadata,
      },
      success_url: `${getURL()}/account`,
      cancel_url: `${getURL()}/`,
      metadata: {
        analyticsClientId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.log(err);

    return NextResponse.json(
      { error: { statusCode: 500, message: err.message } },
      { status: 500 },
    );
  }
}
