import fastifyWebsocket from "@fastify/websocket";
import fp from "fastify-plugin";

const clients = new Set();

export default fp(function (fastify, opts, done) {
  fastify.register(fastifyWebsocket);

  fastify.decorate("broadcast", (event, data) => {
    const message = JSON.stringify({ event, data });
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  });

  fastify.decorate("websocketSend", (event, data) => {
    const message = JSON.stringify({ event, data });
    for (const client of clients) {
      if (client.id === data.id) {
        client.socket.send(message);
      }
    }
  });

  fastify.addHook("onRequest", (req, reply, done) => {
    req.websocketSend = fastify.websocketSend;
    done();
  });

  fastify.get(
    "/ws",
    { websocket: true },
    async function handler(connection, req, reply) {
      connection.socket.on("message", function (message) {
        try {
          const data = JSON.parse(message.toString());
          if (data.event === "register") {
            clients.add({
              id: data.deviceId,
              socket: connection,
            });
          }
          console.log(data);
        } catch (error) {
          console.log("Error parsing message:", error);
        }
      });
    }
  );

  done();
});
