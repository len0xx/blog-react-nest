import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const PORT = +process.env.PORT

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useGlobalPipes(new ValidationPipe())

    app.enableCors({
        origin: '*',
        allowedHeaders: '*',
        methods: 'GET,POST,PATCH,OPTIONS,DELETE'
    })

    const IP = '0.0.0.0'
    const FINAL_PORT = PORT || 8000
    await app.listen(
        FINAL_PORT,
        IP,
        () => console.log(`The server is up and listening at http://${IP}:${FINAL_PORT}`)
    )
}

bootstrap()
