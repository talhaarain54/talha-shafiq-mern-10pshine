import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      level: isProduction ? "info" : "debug",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
    {
      target: "pino/file",
      level: "info", 
      options: { 
        destination: "./logs/app.log", 
        mkdir: true 
      },
    },
  ],
});

const logger = pino(
  {
    level: isProduction ? "info" : "debug",
  },
  transport
);

export default logger;