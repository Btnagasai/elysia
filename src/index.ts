import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { userRouter } from './routes/userRouter'
import { productRouter } from './routes/productRouter'
import cors from '@elysiajs/cors'
import { logger } from '@bogeychan/elysia-logger'
import authRouter from './routes/authRouter'
import { orderRouter } from './routes/orderRoute'


const app = new Elysia()
    app.use(cors());
    app.use(logger())
    app.use(swagger({
        path:"/swagger"
    }))
    
    .get('/', () => {
        return { message: 'Hai, World!' }
    })
    
    .use(userRouter)
    .use(authRouter)
    .use(productRouter)
    .use(orderRouter)
    .listen(3000)