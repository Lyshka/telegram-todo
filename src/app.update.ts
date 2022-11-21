import { Ctx, Hears, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { actionButtons } from './app.buttons';
import { AppService } from './app.service';
import { showList } from './app.utils';
import { Context } from './context.interface';

const todos = [{
  id: 1,
  name: 'Помыть посуду',
  isCOmpleted: false,
},
{
  id: 2,
  name: 'Помыть полы',
  isCOmpleted: false,
},
{
  id: 3,
  name: 'Помыть окна',
  isCOmpleted: true,
},]

@Update()
export class AppUpdate {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>, private readonly appService: AppService) { }

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Добро пожаловать!');

    await ctx.reply('Что вы хотите сделать?', actionButtons());
  }

  @Hears('📔 Список задач')
  async listTask(ctx: Context) {
    ctx.deleteMessage()
    await ctx.reply(showList(todos));
  }

  @Hears('✅ Завершить')
  async doneTask(ctx: Context) {
    ctx.session.type = 'done';
    await ctx.deleteMessage()
    await ctx.reply('Введите номер задачи, которое хотите завершить:');
  }

  @Hears('📝 Редактирование')
  async editTask(ctx: Context) {
    ctx.session.type = 'edit';
    await ctx.deleteMessage()
    await ctx.replyWithHTML('Введите номер задачи и новое название:\n(Формат: <b>1 | Новое название)</b>');
  }

  @Hears('❌ Удаление')
  async deleteTask(ctx: Context) {
    ctx.session.type = 'remove';
    ctx.deleteMessage()
    await ctx.reply('Введите номер задачи, которое хотите завершить:');
  }

  @On('text')
  async getMessage(@Message("text") message: string, @Ctx()ctx: Context) {
    if (!ctx.session.type) return

    if(ctx.session.type === "done") {
      const todo = todos.find((t) => t.id === +message);
      if(!todo) {
        await ctx.reply('Задача не найдена!');
        return;
      }

      todo.isCOmpleted = !todo.isCOmpleted;

      await ctx.reply(showList(todos));
    }

    if(ctx.session.type === "edit") {
      const [taskId, taskName] = message.split('|').map((t) => t.trim());

      const todo = todos.find((t) => t.id === +taskId);

      if(!todo) {
        await ctx.reply('Задача не найдена!');
        return;
      }

      todo.name = taskName;

      await ctx.reply(showList(todos));
    }

    if(ctx.session.type === "remove") {
      const todo = todos.find((t) => t.id === +message);

      if(!todo) {
        await ctx.reply('Задача не найдена!');
        return;
      }

      await ctx.reply(showList(todos.filter(t => t.id !== +message)));
    }
  }
}
