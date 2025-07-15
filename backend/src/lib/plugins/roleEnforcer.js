import fp from "fastify-plugin";

export default fp(function (fastify, opts, done) {
  fastify.addHook("onRoute");
});
