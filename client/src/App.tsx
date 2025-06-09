
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskStats } from '@/components/TaskStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Task, CreateTaskInput } from '../../server/src/schema';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const result = await trpc.getTasks.query();
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (data: CreateTaskInput) => {
    setIsLoading(true);
    try {
      const newTask = await trpc.createTask.mutate(data);
      setTasks((prev: Task[]) => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompletion = async (id: number, completed: boolean) => {
    try {
      await trpc.updateTaskCompletion.mutate({ id, completed });
      setTasks((prev: Task[]) =>
        prev.map((task: Task) =>
          task.id === id ? { ...task, completed } : task
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await trpc.deleteTask.mutate({ id });
      setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const completedTasks = tasks.filter((task: Task) => task.completed);
  const pendingTasks = tasks.filter((task: Task) => !task.completed);
  const overdueTasks = pendingTasks.filter((task: Task) => new Date(task.deadline) < new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ✨ Task Master
          </h1>
          <p className="text-gray-600">Stay organized and get things done!</p>
        </div>

        {/* Stats Cards */}
        <TaskStats
          totalTasks={tasks.length}
          completedTasks={completedTasks.length}
          pendingTasks={pendingTasks.length}
          overdueTasks={overdueTasks.length}
        />

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Add Task Form */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                📝 Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm onSubmit={handleCreateTask} isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                📈 Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
              {overdueTasks.length > 0 && (
                <div className="text-red-600 text-sm font-medium">
                  ⚠️ {overdueTasks.length} task(s) overdue
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Task Lists */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                🎯 Pending Tasks ({pendingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList
                tasks={pendingTasks}
                onToggleCompletion={handleToggleCompletion}
                onDeleteTask={handleDeleteTask}
                showCompleted={false}
              />
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  ✅ Completed Tasks ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={completedTasks}
                  onToggleCompletion={handleToggleCompletion}
                  onDeleteTask={handleDeleteTask}
                  showCompleted={true}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-6">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet!</h3>
              <p className="text-gray-500">Add your first task above to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
