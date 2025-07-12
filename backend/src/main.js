import Fastify from "fastify";
import usersRoute from "./routes/users/index.js";
import issuesRoute from "./routes/issues/index.js";
const fastify = Fastify({
  logger: true,
});

fastify.get("/", async function handler(request, reply) {
  return { hello: "world" };
});

fastify.register(usersRoute, { prefix: "v1" });
fastify.register(issuesRoute, { prefix: "v1" });

try {
  await fastify.listen({ port: 5000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
