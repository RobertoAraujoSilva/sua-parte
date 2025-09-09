import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function TodoExample() {
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select();

      if (todos && todos.length > 0) {
        setTodos(todos);
      }
    }

    getTodos();
  }, []);

  return (
    <div>
      {todos.map((todo, index) => (
        <li key={todo.id || index}>{todo.title || todo.name || JSON.stringify(todo)}</li>
      ))}
    </div>
  );
}

export default TodoExample;