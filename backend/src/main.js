import Fastify from "fastify";
import { authRoute, issuesRoute, usersRoute } from "./routes/index.js";
import websocket from "./lib/plugins/websockets.js";
import verifyToken from "./lib/plugins/verifyToken.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(websocket);
fastify.register(verifyToken);
fastify.register(authRoute, { prefix: "/api/v1" });
fastify.register(issuesRoute, { prefix: "/api/v1" });
fastify.register(usersRoute, { prefix: "/api/v1" });

// Testing route
fastify.register(async function handler(fastify) {
  fastify.post(
    "/",
    {
      config: {
        protected: true,
        role: "admin",
      },
    },
    async function handler(request, reply) {
      const { id } = request.body;
      request.websocketSend("cheese", { message: "noice", id: id });
      for (let client of request.server.websocketServer.clients) {
        client.send(String(request.who));
        client.send(JSON.stringify({ hello: "world" }));
      }
      return { hello: "world" };
    }
  );
});

try {
  await fastify.listen({ port: 5000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
