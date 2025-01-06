import Elysia, { error, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { prisma } from "../models/db";

export const authRouter = new Elysia({ prefix: "/auth" })
    .use(jwt({ secret: Bun.env.JWT_TOKEN as string }))
    .post(
        "/login",
        async ({ body, jwt }) => {
            const { email, password } = body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !(await Bun.password.verify(password, user.password))) {
                return error(401, 'Invalid email or password');
            }

            const token = await jwt.sign({ sub: user.id });
            return {
                token,
                user: { id: user.id, name: user.name, email: user.email, image: user.image },
            };
        },
        {
            body: t.Object({ email: t.String(), password: t.String() }),
        }
    );

export default authRouter;
