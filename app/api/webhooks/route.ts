import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { GA4_ID } from "../../../global";
import { stripe } from "../../../utils/stripe";
import {
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord,
} from "../../../utils/supabase-admin";

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: NextRequest) {
  console.log("### Stripe webhook ###");

  // Stripe needs the exact bytes it signed. A route handler hands them over
  // directly, so the `bodyParser: false` config and the stream-to-buffer
  // helper the Pages API route needed are both gone.
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig) {
      return new Response("Webhook Error: Signature is missing", {
        status: 400,
      });
    }
    if (!webhookSecret) {
      return new Response("Webhook Error: Webhook secret is missing", {
        status: 400,
      });
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);

    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("Stripe event:", event.type);
  console.log("Stripe event data object:", event.data.object);

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created",
          );
          break;
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true,
            );
          }

          if (process.env.GA4_API_SECRET) {
            const params = new URLSearchParams({
              measurement_id: GA4_ID,
              api_secret: process.env.GA4_API_SECRET,
            });

            const trackingUrl = `https://www.google-analytics.com/mp/collect?${params.toString()}`;

            try {
              await axios.post(trackingUrl, {
                client_id: (event.data.object as any)?.metadata
                  ?.analyticsClientId,
                timestamp_micros: String(new Date().getTime() * 1000),
                events: [
                  {
                    name: "purchase",
                    params: {
                      currency: checkoutSession.currency ?? "USD",
                      value: (checkoutSession.amount_total ?? 0) / 100,
                    },
                  },
                ],
              });
              console.log("Stripe event tracked successfully");
            } catch (err) {
              console.error("Failed to track purchase", err);
            }
          }

          break;
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.log(error);

      return new Response(
        'Webhook error: "Webhook handler failed. View logs."',
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
