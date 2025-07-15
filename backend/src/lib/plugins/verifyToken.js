import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import rolePermissions from "../../../config/rolePermissions.json" with { type: "json" };

export default fp(function (fastify, opts, done) {
  fastify.addHook("onRequest", (req, reply, done) => {
    const routeOptions = req.routeOptions?.config ?? {};
    if (routeOptions.protected) {
      if (!req.headers.authorization) {
        return reply.code(401).send({
          message: "Insufficient permissions",
        });
      } else {
        try {
          const authTokenHeader = req.headers.authorization;
          const authToken = authTokenHeader.split(" ")[1];
          if (!authToken) {
            return reply.code(401).send({
              message: "Insufficient permissions",
            });
          }
          const decodeToken = jwt.verify(authToken, process.env.JWT_SECRET);
          if (!decodeToken || !decodeToken.role) {
            return reply.code(403).send({
              message: "Unauthorised",
            });
          }
        } catch (error) {
          console.log(error);
          return reply.code(500).send({
            error: "server error",
            message: "Something went wrong, please try again!",
          });
        }
      }
    }
    done();
  });

  done();
});
