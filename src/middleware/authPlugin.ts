import jwt from '@elysiajs/jwt';
import Elysia, { error } from 'elysia';
import { prisma } from '../models/db';

export const authPlugin = (app: Elysia) =>
    app
        .use(
            jwt({
                secret: Bun.env.JWT_TOKEN as string, // JWT secret
            })
        )
        .derive(async ({ jwt, headers }) => {
            const authorization = headers.authorization;

            if (!authorization?.startsWith('Bearer ')) {
                return error(401, 'Authorization header invalid');
            }

            const token = authorization.slice(7);
            const payload = await jwt.verify(token).catch(() => null);

            if (!payload?.sub) {
                return error(401, 'Token verification failed');
            }

            const user = await prisma.user.findUnique({
                where: { id: payload.sub as string },
            });

            if (!user) {
                return error(401, 'User not found');
            }

            return { user };
        });
