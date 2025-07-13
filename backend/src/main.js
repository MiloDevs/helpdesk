import Fastify from "fastify";
import usersRoute from "./routes/users/index.js";
import issuesRoute from "./routes/issues/index.js";
import fastifyWebsocket from "@fastify/websocket";
import websocket from "./lib/plugins/websockets.js";

const fastify = Fastify({
  logger: true,
});

const clients = new Set();

fastify.register(websocket);
fastify.register(usersRoute, { prefix: "/api/v1" });
fastify.register(issuesRoute, { prefix: "/api/v1" });
fastify.register(async function handler(fastify) {
  fastify.post("/", async function handler(request, reply) {
    const { id } = request.body;
    request.websocketSend("cheese", { message: "noice", id: id });
    for (let client of request.server.websocketServer.clients) {
      client.send(String(request.who));
      client.send(JSON.stringify({ hello: "world" }));
    }
    return { hello: "world" };
  });
});

try {
  await fastify.listen({ port: 5000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
