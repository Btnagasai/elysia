import Elysia, { error, InternalServerError, t } from "elysia";
import { prisma } from "../models/db";

export const userRouter = new Elysia({ prefix: "/users" })
  .get ("/list", async ({}) => {
    try{
        const users = await prisma.user.findMany({});
        return users;
        } catch (e) {
            return error(500, InternalServerError);

    }
  })
  .post(
    "/create",
    async ({ body }) => {
      try {
        const { name, image, email, password } = body;
        const hashedPassword = await Bun.password.hash(password);
        const newuser = await prisma.user.create({
          data: {
            name,
            image,
            email,
            password: hashedPassword,
            
          },
        });

        return newuser;
      } catch (e) {
        return error(500, "Internal Server Error");
      }
    },
    {
      body: t.Object({
        name: t.String(),
        image: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  .delete(
    "/:id",
    async ({ params}) => {
      try {
        const { id } = params;
        const deletedUser = await prisma.user.delete({
          where: {
           id,
          },
        });

        return deletedUser;
      } catch (e) {
        return error(500, "Internal Server Error");
      }
    },
    {
        params: t.Object({
            id: t.String(),
        })
    }
  )
  .put(
    "/:id",
    async ({ body, params }) => {
      try {
        const {id} = params
        const { name} = body;
        const newuser = await prisma.user.update({
          where: {
            id,
          },
          data: {
            name,
          },
        });

        return newuser;
      } catch (e) {
        return error(500, "Internal Server Error");
      }
    },
    {
      body: t.Object({
        name: t.String(),
       
      }),
      params: t.Object({
        id:t.String()

      }),
    } )

  .get("/profile", async ({}) => {
    return "user profile";
  });
