import Elysia, { error, t } from "elysia";
import { authPlugin } from "../middleware/authPlugin";
import { prisma } from "../models/db";
import Stripe from "stripe";
import { nanoid } from "nanoid";

// Initialize Stripe
const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export const orderRouter = new Elysia({ prefix: "/orders" })
  .use(authPlugin) // Attach authentication middleware
  .post(
    "/",
    async ({ user, body }) => {
      try {
        const { orderItems, deliveryAddress, totalPrice } = body;

        // Validate input
        if (!orderItems || orderItems.length === 0) {
          return error(400, "No order items found");
        }

        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: "inr",
        });

        // Generate an Order ID
        const orderId = `order_${nanoid()}`;

        // Create Order
        const order = await prisma.order.create({
          data: {
            id: orderId,
            user: { connect: { id: user.id } },
            deliveryAddress,
            totalPrice,
            paymentIntentId: paymentIntent.id,
            paymentStatus: "PENDING",
            deliveryStatus: "PENDING",
          },
        });

        // Create Order Items in Bulk
        await prisma.orderItem.createMany({
          data: orderItems.map((item) => ({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        });

        return { order, clientSecret: paymentIntent.client_secret }; // Respond with order and payment details
      } catch (err) {
        // Log error details for debugging
        console.error("Order creation error:", err);

        // Return a proper response if an exception occurs
        return {
          status: 500,
          message: "Internal server error while creating order",
        };
      }
    },
    {
      body: t.Object({
        deliveryAddress: t.String(),
        totalPrice: t.Number(),
        orderItems: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
            price: t.Number(),
          })
        ),
      }),
    }
  );
