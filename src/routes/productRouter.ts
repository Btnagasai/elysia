import Elysia, { error, t } from "elysia";
import { authPlugin } from "../middleware/authPlugin";
import { prisma } from "../models/db";

export const productRouter = new Elysia({ prefix: "/products" })
  .get(
    "/",
    async () => {
      try {
        const products = await prisma.product.findMany();
        return products;
      } catch (e) {
        return error(500, "Failed to fetch products.");
      }
    }
  )
  .post(
    "/create",
    async ({ body }) => {
      try {
        const { name, price, description, image, stock } = body;
        const newProduct = await prisma.product.create({
          data: {
            name,
            price,
            description,
            image,
            stock,
          },
        });
        return newProduct;
      } catch (e) {
        return error(500, "Failed to create product.");
      }
    },
    {
      body: t.Object({
        name: t.String(),
        price: t.Number(),
        description: t.String(),
        image: t.String(),
        stock: t.Number(),
      }),
    }
  )
  .use(authPlugin)
  .get(
    "/:id",
    async ({ params }) => {
      const { id } = params;
      try {
        const product = await prisma.product.findUnique({
          where: { id },
        });
        if (!product) return error(404, "Product not found.");
        return product;
      } catch (e) {
        return error(500, "Failed to fetch the product.");
      }
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const { id } = params;
      try {
        const { name, price, description,image } = body;
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            name,
            price,
            description,
            image,
          },
        });
        if (!updatedProduct) return error(404, "Product not found.");
        return updatedProduct;
      } catch (e) {
        return error(500, "Failed to update the product.");
      }
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
      body: t.Object({
        name: t.String(),
        price: t.Number(),
        description: t.String(),
        image:t.String(),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      const { id } = params;
      try {
        // Check if the product exists before attempting to delete
        const productExists = await prisma.product.findUnique({
          where: { id },
        });
  
        if (!productExists) {
          return error(404, "Product not found.");
        }
  
        // Proceed with deletion if the product exists
        const deletedProduct = await prisma.product.delete({
          where: { id },
        });
  
        return { message: "Product deleted successfully." };
      } catch (e) {
        console.error(e); // Log the error to better understand the issue
        return error(500, "Failed to delete the product.");
      }
    },
    {
      params: t.Object({
        id: t.String({ minLength: 1 }),
      }),
    }
  );