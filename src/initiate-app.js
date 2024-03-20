import db_connection from "../DB/connection.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollSavedDocuments } from "./middlewares/rollback-saved-documents-middleware.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files-middleware.js";
import { gracefulShutdown, scheduleJob } from "node-schedule";
import { changeExpiredCoupons} from "./utils/Coupon/crons.js"
import * as routers from "./modules/index.routes.js";

export const initiateApp = (app, express) => {
  const port = process.env.PORT;

  app.use(express.json());

  db_connection();
  app.use("/auth", routers.authRouter);
  app.use("/user", routers.userRouter);
  app.use("/category", routers.categoryRouter);
  app.use("/subCategory", routers.subCategoryRouter);
  app.use("/brand", routers.brandRouter);
  app.use("/product", routers.productRouter);
  app.use("/cart", routers.cartRouter);
  app.use("/coupon", routers.couponRouter);
  app.use("/order", routers.orderRouter);
  app.use("/review", routers.reviewRouter);


  app.use(globalResponse , rollbackUploadedFiles , rollSavedDocuments);

  changeExpiredCoupons()
  // function to disable crons
  gracefulShutdown()

  app.get("/", (req, res) => res.send("Hello World!"));
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
