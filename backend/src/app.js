import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { swaggerOptions } from "./config/swagger.js";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import chainRoutes from "./modules/chains/chain.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "./modules/index.js";

export const app = Fastify({
    logger: true
});

// await app.register(cors, {
//     origin: true
// });

await app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

await app.register(jwt, {
    secret: process.env.JWT_SECRET
});

await app.register(swagger, swaggerOptions);

await app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
    prefix: "/public/",
});

await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
        docExpansion: "list",
        deepLinking: true,
    },
});

await app.register(authRoutes);
await app.register(userRoutes);
await app.register(chainRoutes);