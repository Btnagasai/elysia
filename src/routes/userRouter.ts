import Elysia, { error, t } from "elysia";
import { prisma } from "../models/db";


export const userRouter = new Elysia({ prefix: "/user" })
  .get("/list", async () => {
    try {
      const users = await prisma.user.findMany();
      return { users };
    } catch (e) {
      return error(500, "Internal Server Error");
    }
  })
  .post(
    "/create",
    async ({ body }) => {
      try {
        const { email, image, name, password } = body;
        const hashedPassword = await Bun.password.hash(password);

        const newUser = await prisma.user.create({
          data: {
            email,
            image,
            name,
            password: hashedPassword,
          },
        });

        return newUser;
      } catch (e) {
        return error(500, "Internal Server Error");
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ minLength: 1 }),
        image: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  .delete("/:id", async ({ params }) => {
    try {
      const { id } = params;
      const deleteUser = await prisma.user.delete({
        where: {
          id: id,
        }
      });
      return deleteUser;
    } catch (e) {
      return error(500, "Internal Server Error");
    }
  }, {
    params: t.Object({
      id: t.String({ minLength: 1, }),
    }),
  })


  .put(
    "/:id",
    async ({ params, body }) => {
      try {
        const { id } = params;
        const { name } = body;

        const updatedUser = await prisma.user.update({
          where: {
            id,
          },
          data: {
            name,
          },
        });

        return { name: updatedUser.name };
      } catch (e) {
        return error(500, "Internal Server Error");
      }
    },
    {
      params: t.Object({
        id: t.String({
          minLength: 1,
        }),
      }),
      body: t.Object({
        name: t.String({
          minLength: 1,
        }),
      }),
    }
  )
  .get("/profile", async () => {
    return { message: "user profile" };
  });

export default userRouter;