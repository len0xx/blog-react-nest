import {
    Controller,
    Get,
    Header,
} from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'

@Controller('api/healthcheck')
export class HealthController {
    constructor() {}

    @Get()
    @Header('Content-Type', 'application/json')
    @ApiTags('health')
    @ApiOkResponse({ description: 'The server is up and listening for connections' })
    async checkHealth(): Promise<string> {
        const response = {
            ok: true,
            message: 'Healthy'
        }
        return JSON.stringify(response)
    }
}
