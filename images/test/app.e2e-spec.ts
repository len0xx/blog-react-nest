import { Test } from '@nestjs/testing'
import { HttpStatus } from '@nestjs/common'
import { AppModule } from './../src/app.module'
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { PostService } from './../src/post.service'
import { PrismaService } from './../src/prisma.service'

describe('PostController (e2e)', () => {
    let app: NestFastifyApplication
    const prismaService = new PrismaService()
    const postService = new PostService(prismaService)

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PostService)
            .useValue(postService)
            .compile()

        app = moduleRef.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        )

        await app.init()
        await app.getHttpAdapter().getInstance().ready()
    })

    it('/ (GET) 404', async () => {
        return app
            .inject({
                method: 'GET',
                url: '/',
            })
            .then(async (result) => {
                expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND)
            })
    })

    it('/api/post (GET)', async () => {
        return app
            .inject({
                method: 'GET',
                url: '/api/post',
            })
            .then(async (result) => {
                expect(result.statusCode).toEqual(HttpStatus.OK)
                expect(result.payload).toEqual(
                    JSON.stringify(await postService.getAll()),
                )
            })
    })

    afterAll(async () => {
        await app.close()
    })
})
