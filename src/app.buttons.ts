import { Markup } from "telegraf";

export function actionButtons() {
	return Markup.keyboard([
		Markup.button.callback('✏ Создать задачу', 'create'),
		Markup.button.callback('📔 Список задач', 'list'),
		Markup.button.callback('✅ Завершить', 'done'),
		Markup.button.callback('📝 Редактирование', 'edit'),
		Markup.button.callback('❌ Удаление', 'delete'),
	],
		{
			columns: 2,

		})
		.resize()
}