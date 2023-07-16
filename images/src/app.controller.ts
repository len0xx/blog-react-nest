import {
    Controller,
    Post,
    UnsupportedMediaTypeException,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express, Request } from 'express'
import { AppService } from './app.service'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

const API_ENDPOINT = 'http://blog.local'

const imageFileFilter = (_: Request, file: Express.Multer.File, callback: (e: Error, a: boolean) => void) => {
    if (!file.originalname.toLocaleLowerCase().match(/\.(jpg|jpeg|png|svg|webp)$/)) {
        return callback(new UnsupportedMediaTypeException('Only images are allowed (JPG/PNG/SVG/WEBP)'), false)
    }

    callback(null, true)
}

const editFileName = (_: Request, file: Express.Multer.File, callback: (e: Error, fn: string) => void) => {
    const name = file.originalname.split('.')[0]
    const fileExtName = extname(file.originalname)
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('')

    callback(null, `${name}-${randomName}${fileExtName}`)
}

const maxFileSize = 10 * 1024 * 1024

const multerOptions: MulterOptions = {
    storage: diskStorage({
        destination: './files',
        filename: editFileName
    }),
    fileFilter: imageFileFilter,
    limits: {
        fileSize: maxFileSize
    }
}

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async uploadedFile(@UploadedFile() file: Express.Multer.File) {
        const response = {
            url: `${ API_ENDPOINT }/files/${ file.filename }`
        }

        return response
    }
}
