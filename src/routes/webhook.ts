import Elysia, { error } from "elysia";
import Stripe from "stripe";


export const webhook = new Elysia({}).post(
  "/webhook",
  async ({ body, headers }) => {
    const stripeClient = new Stripe(Bun.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-11-20.acacia",
    });
    const sig = headers["stripe-signature"];
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(
        // @ts-ignore
        body,
        sig,
        "whsec_d542dbfdb39b6c167a2f9c5ecab4d83b911b50a22c96ba2f4bfbf92833b57453"
      );
    } catch (err) {
      return error(400, "Bad Request");
    }

    // Handle the event
    switch (event.type) {
      case "charge.succeeded":
        const chargeSucceeded = event.data.object;
        // Then define and call a function to handle the event charge.succeeded
        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;

        // Then define and call a function to handle the event payment_intent.created
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log("payment completed", paymentIntentSucceeded);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return { received: true };
  }
);
