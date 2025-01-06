import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { userRouter } from "./routes/userRouter";
import { productRouter } from "./routes/productRouter";
import { orderRouter } from "./routes/orderRoute";
import { logger } from "@bogeychan/elysia-logger";
import jwt from "@elysiajs/jwt";
import authRouter from "./routes/authRouter";
import { webhook } from "./routes/webhook";




const app = new Elysia();


app.use(cors());
app.use(logger());
app.use(
    swagger({
    path:"/swagger",
})
)
.get("/", () => {
    return "Main Route" ;
})
.use(userRouter)
.use(productRouter)
.use(authRouter)
.use(orderRouter)
.use(webhook)
.listen(3000);
