'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  day: number;
}

export function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Проверить объекты на сроки', completed: false, day: 26 },
    { id: 2, text: 'Обновить отчет по квадратуре', completed: true, day: 26 },
    { id: 3, text: 'Встреча с подрядчиками', completed: false, day: 27 },
    { id: 4, text: 'Проверить материалы на складе', completed: false, day: 28 },
    { id: 5, text: 'Провести замеры', completed: false, day: 29 },
    { id: 6, text: 'Составить план на след. неделю', completed: false, day: 30 },
    { id: 7, text: 'Отчет за месяц', completed: false, day: 31 },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo, 
        completed: false, 
        day: new Date().getDate() 
      }]);
      setNewTodo('');
    }
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEditing = (id: number) => {
    if (editingText.trim()) {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, text: editingText } : todo
      ));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const getDayName = (day: number) => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date().getDate();
    const dayIndex = (day - today + 7) % 7;
    return days[dayIndex];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Задачи на неделю</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Новая задача..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
        />
        <Button onClick={addTodo} className="bg-[#1976d2] hover:bg-[#1565c0] h-10">
          <span className="mr-2">+</span>
          Добавить
        </Button>
      </div>
      <div className="space-y-3">
        {todos.map((todo) => (
          <div 
            key={todo.id} 
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              todo.completed ? 'bg-gray-50 dark:bg-slate-700' : 'bg-blue-50'
            }`}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                todo.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-slate-600 hover:border-blue-500'
              }`}
            >
              {todo.completed && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              {editingId === todo.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditing(todo.id);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                  />
                  <Button onClick={() => saveEditing(todo.id)} className="bg-green-500 hover:bg-green-600 text-white h-8 text-sm px-3">
                    Сохранить
                  </Button>
                  <Button onClick={cancelEditing} variant="outline" className="h-8 text-sm px-3">
                    Отмена
                  </Button>
                </div>
              ) : (
                <>
                  <p className={`text-sm font-medium ${todo.completed ? 'text-gray-500 dark:text-slate-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {todo.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {getDayName(todo.day)}, {todo.day} число
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-1">
              {editingId !== todo.id && (
                <>
                  <button
                    onClick={() => startEditing(todo)}
                    className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800 rounded transition-colors"
                    title="Редактировать"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:bg-slate-800 rounded transition-colors"
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
