export const showList = (todos) => `Ваши задачи:\n${todos.map((todo) => `${todo.name} ${todo.isCOmpleted ? "☑" : "☐"}`).join('\n')}`