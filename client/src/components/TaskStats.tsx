
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskStatsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export function TaskStats({ totalTasks, completedTasks, pendingTasks, overdueTasks }: TaskStatsProps) {
  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: '📋',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending',
      value: pendingTasks,
      icon: '⏳',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: '🚨',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`shadow-md border-0 ${stat.bgColor}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${stat.color} flex items-center gap-2`}>
              <span className="text-lg">{stat.icon}</span>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
