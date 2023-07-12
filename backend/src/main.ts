import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { PrismaService } from './prisma.service'
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

const PORT = +process.env.PORT

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    )

    app.enableCors({
        origin: '*',
        allowedHeaders: '*',
        methods: 'GET,POST,PATCH,OPTIONS,DELETE'
    })

    const prismaService = app.get(PrismaService)
    await prismaService.enableShutdownHooks(app)

    const config = new DocumentBuilder()
        .setTitle('Blog API')
        .setDescription('The blog API description')
        .setVersion('1.0')
        .addTag('blog')
        .addTag('health')
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    const IP = '0.0.0.0'
    const FINAL_PORT = PORT || 8000
    await app.listen(
        FINAL_PORT,
        IP,
        () => console.log(`The server is up and listening at http://${IP}:${FINAL_PORT}`)
    )
}

bootstrap()
