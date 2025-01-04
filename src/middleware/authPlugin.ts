import jwt from '@elysiajs/jwt';
import Elysia, { error } from 'elysia';
import { prisma } from '../models/db';

export const authPlugin = (app: Elysia) =>
    app
        .use(
            jwt({
                secret: Bun.env.JWT_TOKEN as string, // Environment variable for JWT secret
            })
        )
        .derive(async ({ jwt, headers }) => {
            const authorization = headers.authorization;

            // Validate Authorization Header
            if (!authorization?.startsWith('Bearer')) {
                return error(401, 'Unauthorized');
            }

            // Extract and verify the token
            const token = authorization.slice(7);
            const payload = await jwt.verify(token);

            if (!payload) {
                return error(401, 'Unauthorized');
            }

            // Fetch user from the database using the token's payload
            const user = await prisma.user.findUnique({
                where: {
                    id: payload.sub as string, // Use 'sub' (subject) from token
                },
            });

            if (!user) {
                return error(401, 'Unauthorized');
            }

            // Attach the user details, including the id, for later use
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            };
        });