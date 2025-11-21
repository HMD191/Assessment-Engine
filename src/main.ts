import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ các field không có trong DTO
      forbidNonWhitelisted: true, // ném lỗi nếu có field lạ
      transform: true, // chuyển types (ví dụ "1" => 1)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
