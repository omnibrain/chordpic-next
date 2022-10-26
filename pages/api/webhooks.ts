import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { Readable } from "node:stream";
import { stripe } from "../../utils/stripe";
import {
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord,
} from "../../utils/supabase-admin";
import axios from "axios";
import { GA4_ID } from "../../global";

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

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

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    console.log("### Stripe webhook ###");

    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET_LIVE ??
      process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (!sig) {
        return res.status(400).send(`Webhook Error: Signature is missing`);
      }
      if (!webhookSecret) {
        return res.status(400).send(`Webhook Error: Webhook secret is missing`);
      }

      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
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
              event.type === "customer.subscription.created"
            );
            break;
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            if (checkoutSession.mode === "subscription") {
              const subscriptionId = checkoutSession.subscription;
              await manageSubscriptionStatusChange(
                subscriptionId as string,
                checkoutSession.customer as string,
                true
              );
            }

            // Record metrics using the Google Analytics Measurement Protocol
            // See https://developers.google.com/analytics/devguides/collection/protocol/v1/devguide
            const params = new URLSearchParams({
              v: "1", // Version
              tid: GA4_ID, // Tracking ID / Property ID.
              cid: (event.data.object as any)?.metadata?.analyticsClientId, // Anonymous Client ID
              t: "event", // Event hit type
              ec: "ecommerce", // Event Category
              ea: "purchase", // Event Action
            });

            console.log("Stripe event tracking url:", event.data.object);
            const trackingUrl = `https://www.google-analytics.com/batch?${params.toString()}`;

            try {
              await axios.post(trackingUrl);
            } catch (err) {
              console.error("Failed to track purchase", err);
            }

            break;
          default:
            throw new Error("Unhandled relevant event!");
        }
      } catch (error) {
        console.log(error);
        return res
          .status(400)
          .send('Webhook error: "Webhook handler failed. View logs."');
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default webhookHandler;
