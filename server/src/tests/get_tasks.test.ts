
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { getTasks } from '../handlers/get_tasks';

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();
    expect(result).toEqual([]);
  });

  it('should return all tasks', async () => {
    // Create test tasks
    const task1 = await db.insert(tasksTable)
      .values({
        name: 'First Task',
        deadline: new Date('2024-12-31'),
        completed: false
      })
      .returning()
      .execute();

    const task2 = await db.insert(tasksTable)
      .values({
        name: 'Second Task',
        deadline: new Date('2024-12-25'),
        completed: true
      })
      .returning()
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    expect(result.map(t => t.name)).toContain('First Task');
    expect(result.map(t => t.name)).toContain('Second Task');
  });

  it('should return tasks ordered by created_at descending', async () => {
    // Create tasks with slight delay to ensure different timestamps
    const firstTask = await db.insert(tasksTable)
      .values({
        name: 'First Created',
        deadline: new Date('2024-12-31'),
        completed: false
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondTask = await db.insert(tasksTable)
      .values({
        name: 'Second Created',
        deadline: new Date('2024-12-25'),
        completed: false
      })
      .returning()
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    // Most recently created should be first
    expect(result[0].name).toEqual('Second Created');
    expect(result[1].name).toEqual('First Created');
  });

  it('should return tasks with all required fields', async () => {
    await db.insert(tasksTable)
      .values({
        name: 'Test Task',
        deadline: new Date('2024-12-31'),
        completed: false
      })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(1);
    const task = result[0];
    
    expect(task.id).toBeDefined();
    expect(task.name).toEqual('Test Task');
    expect(task.deadline).toBeInstanceOf(Date);
    expect(task.completed).toEqual(false);
    expect(task.created_at).toBeInstanceOf(Date);
  });
});
