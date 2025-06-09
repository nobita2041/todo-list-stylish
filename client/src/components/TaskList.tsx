
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { Task } from '../../../server/src/schema';

interface TaskListProps {
  tasks: Task[];
  onToggleCompletion: (id: number, completed: boolean) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
  showCompleted: boolean;
}

export function TaskList({ tasks, onToggleCompletion, onDeleteTask, showCompleted }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">{showCompleted ? '🎉' : '📝'}</div>
        <p>{showCompleted ? 'No completed tasks yet!' : 'No pending tasks!'}</p>
      </div>
    );
  }

  const isOverdue = (deadline: Date) => {
    return new Date(deadline) < new Date() && !showCompleted;
  };

  const getDeadlineText = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day(s) overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task: Task) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
            showCompleted
              ? 'bg-green-50 border-green-200'
              : isOverdue(task.deadline)
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked: boolean) => onToggleCompletion(task.id, checked)}
            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />

          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">
                📅 {task.deadline.toLocaleDateString()}
              </span>
              {!showCompleted && (
                <Badge
                  variant={isOverdue(task.deadline) ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {getDeadlineText(task.deadline)}
                </Badge>
              )}
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                🗑️
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{task.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteTask(task.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
