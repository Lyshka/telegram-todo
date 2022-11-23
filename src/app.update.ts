import { Ctx, Hears, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { actionButtons } from './app.buttons';
import { AppService } from './app.service';
import { showList } from './app.utils';
import { Context } from './context.interface';

@Update()
export class AppUpdate {
	constructor(@InjectBot() private readonly bot: Telegraf<Context>, private readonly appService: AppService) { }

	@Start()
	async startCommand(ctx: Context) {
		await ctx.reply('Добро пожаловать!');

		await ctx.reply('Что вы хотите сделать?', actionButtons());
	}

	@Hears('✏ Создать задачу')
	async createTask(ctx: Context) {
		ctx.session.type = 'create';
		await ctx.reply("Введите название задачи: ");
		ctx.deleteMessage()
	}

	@Hears('📔 Список задач')
	async listTask(ctx: Context) {
		const todos = await this.appService.getAll();
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
	async getMessage(@Message("text") message: string, @Ctx() ctx: Context) {
		if (!ctx.session.type) return

		if (ctx.session.type === "create") {
			const todos = await this.appService.createTask(message);

			await ctx.reply(showList(todos));
		}

		if (ctx.session.type === "done") {
			const todos = await this.appService.doneTask(+message);

			if (!todos) {
				await ctx.reply('Задача не найдена!');
				return;
			}

			await ctx.reply(showList(todos));
		}

		if (ctx.session.type === "edit") {
			const [taskId, taskName] = message.split('|').map((t) => t.trim());

			const todos = await this.appService.editTask(+taskId, taskName);

			if (!todos) {
				await ctx.deleteMessage()
				await ctx.reply('Задача не найдена!');
				return;
			}

			await ctx.reply(showList(todos));
		}

		if (ctx.session.type === "remove") {
			const todos = await this.appService.deleteTask(+message);

			if (!todos) {
				await ctx.reply('Задача не найдена!');
				return;
			}

			await ctx.reply(showList(todos));
		}
	}
}
