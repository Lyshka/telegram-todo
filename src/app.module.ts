import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppService } from './app.service';
import {AppUpdate} from "./app.update"

const sessioons = new LocalSession({database: "session_db.json"});

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessioons.middleware()],
      token: '1843390727:AAGxE0YI3SJ_dO7h2F_hQixfMIrX0Ytjtm4',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: "todo-app-tg-bot",
      username: "postgres",
      password: "",
      entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
      migrations: [join(__dirname, '**', '*.migration{.ts,.js}')],
      synchronize: true,
    })
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
