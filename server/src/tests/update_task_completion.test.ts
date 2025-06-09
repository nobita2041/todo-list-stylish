
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskCompletionInput } from '../schema';
import { updateTaskCompletion } from '../handlers/update_task_completion';
import { eq } from 'drizzle-orm';

describe('updateTaskCompletion', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task completion status to true', async () => {
    // Create a test task first
    const insertResult = await db.insert(tasksTable)
      .values({
        name: 'Test Task',
        deadline: new Date('2024-12-31'),
        completed: false
      })
      .returning()
      .execute();

    const taskId = insertResult[0].id;

    const input: UpdateTaskCompletionInput = {
      id: taskId,
      completed: true
    };

    const result = await updateTaskCompletion(input);

    // Verify the result
    expect(result.id).toEqual(taskId);
    expect(result.name).toEqual('Test Task');
    expect(result.completed).toBe(true);
    expect(result.deadline).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update task completion status to false', async () => {
    // Create a completed test task first
    const insertResult = await db.insert(tasksTable)
      .values({
        name: 'Completed Task',
        deadline: new Date('2024-12-31'),
        completed: true
      })
      .returning()
      .execute();

    const taskId = insertResult[0].id;

    const input: UpdateTaskCompletionInput = {
      id: taskId,
      completed: false
    };

    const result = await updateTaskCompletion(input);

    // Verify the result
    expect(result.id).toEqual(taskId);
    expect(result.name).toEqual('Completed Task');
    expect(result.completed).toBe(false);
    expect(result.deadline).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated completion status to database', async () => {
    // Create a test task first
    const insertResult = await db.insert(tasksTable)
      .values({
        name: 'Test Task for DB Check',
        deadline: new Date('2024-12-31'),
        completed: false
      })
      .returning()
      .execute();

    const taskId = insertResult[0].id;

    const input: UpdateTaskCompletionInput = {
      id: taskId,
      completed: true
    };

    await updateTaskCompletion(input);

    // Query the database to verify the update was persisted
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].completed).toBe(true);
    expect(tasks[0].name).toEqual('Test Task for DB Check');
  });

  it('should throw error when task does not exist', async () => {
    const input: UpdateTaskCompletionInput = {
      id: 999999, // Non-existent task ID
      completed: true
    };

    await expect(updateTaskCompletion(input))
      .rejects
      .toThrow(/Task with id 999999 not found/i);
  });
});
