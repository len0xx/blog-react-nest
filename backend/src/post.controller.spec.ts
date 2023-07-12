import { Test, TestingModule } from '@nestjs/testing'
import { PostController } from './post.controller'
import { PostService } from './post.service'
import { PrismaService } from './prisma.service'

describe('PostController', () => {
    let appController: PostController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [PostController],
            providers: [PrismaService, PostService],
        }).compile()

        appController = app.get<PostController>(PostController)
    })

    describe('read posts', () => {
        it('should return posts array', async () => {
            expect(
                JSON.parse(
                    await appController.getPosts()
                )
            ).toHaveProperty('length')
        })
    })
})
