import swaggerJSDoc from "swagger-jsdoc";
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo App API",
      version: "1.0.0",
      description: "Industry-grade TODO application APIs",
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token",
        },
      },
    },
    paths: {},
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/app/api/**/*.ts", "./src/swagger/**/*.ts"],
});
