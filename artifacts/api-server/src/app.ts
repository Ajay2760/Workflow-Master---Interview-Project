import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Production Static Serving for fullstack deployment
const possiblePublicPaths = [
  path.resolve(process.cwd(), "artifacts/workflow-app/dist/public"),
  path.resolve(process.cwd(), "../workflow-app/dist/public"),
  path.resolve(import.meta.dirname, "../../workflow-app/dist/public"),
];

const publicPath = possiblePublicPaths.find((p) => fs.existsSync(p));

if (publicPath) {
  logger.info({ publicPath }, "Serving static frontend assets from public path");
  app.use(express.static(publicPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

export default app;

