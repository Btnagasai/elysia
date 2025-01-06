import Elysia, { error, t } from "elysia";
import { authPlugin } from "../middleware/authPlugin";
import { prisma } from "../models/db";
import Stripe from "stripe";
import { nanoid } from "nanoid";

const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export const orderRouter = new Elysia({ prefix: "/orders" })
  .use(authPlugin)
  .post(
    "/",
    async ({ user, body }) => {
      try {
        const { orderItems, deliveryAddress, totalPrice } = body;

        // 1. Validate `orderItems` length
        if (!orderItems || !orderItems.length) {
          return error(400, "No order items found");
        }

        // 2. Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.floor(totalPrice * 100), // Stripe accepts cents
          currency: "inr",
        });

        // 3. Create Order with Items
        const orderId = `order_${nanoid()}`;
        const order = await prisma.order.create({
          data: {
            id: orderId,
            user: { connect: { id: user.id } },
            deliveryAddress,
            totalPrice,
            deliveryStatus: "PENDING",
            paymentIntentId: paymentIntent.id,
            paymentStatus: "PENDING",
            paymentDetails: { amount: paymentIntent.amount },
          },
        });

        // 4. Bulk Insert OrderItems
        await prisma.orderItem.createMany({
          data: orderItems.map(({ productId, quantity, price }) => ({
            orderId,
            productId,
            quantity,
            price,
          })),
        });

        return { order, clientSecret: paymentIntent.client_secret };
      } catch (error) {
        console.error("Order creation error:", error);
        return error(500, "Internal server error while creating order");
      }
    },
    {
      body: t.Object({
        deliveryAddress: t.String(),
        totalPrice: t.Number(),
        orderItems: t.Array(
          t.Object({ productId: t.String(), quantity: t.Number(), price: t.Number() })
        ),
      }),
    }
  )

  .get("/", async ({ user }) => {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { orderItems: true },
      });
      return orders;
    } catch (e) {
      return error(500, "Failed to fetch orders");
    }
  });
