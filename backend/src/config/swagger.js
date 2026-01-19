export const swaggerOptions = {
    openapi: {
      info: {
        title: "One Cap API",
        description: "Backend APIs for One Cap game & admin panel",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Local server",
        },
      ],
      tags: [
        { name: "Auth", description: "Authentication APIs" },
        { name: "Users", description: "User management" },
        { name: "Chains", description: "Chain & virality APIs" },
        { name: "Challenges", description: "Cap challenges" },
        { name: "Admin", description: "Admin-only APIs" },
        { name: "Reports", description: "Report management" },
        { name: "Statements", description: "Statement management" },
        { name: "Notifications", description: "Notification management" },
        { name: "Subscriptions", description: "Subscription management" },
        { name: "Games", description: "Game management" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  };
  