import { Module } from '@nestjs/common'
import { PostController } from './post.controller'
import { UserController } from './user.controller'
import { HealthController } from './health.controller'
import { PostService } from './post.service'
import { UserService } from './user.service'
import { PrismaService } from './prisma.service'

@Module({
    imports: [],
    controllers: [PostController, UserController, HealthController],
    providers: [PrismaService, UserService, PostService],
})
export class AppModule {}
