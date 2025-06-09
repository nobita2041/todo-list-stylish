
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

// Test input
const testInput: DeleteTaskInput = {
  id: 1
};

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a task first
    const insertResult = await db.insert(tasksTable)
      .values({
        name: 'Test Task',
        deadline: new Date('2024-12-31')
      })
      .returning()
      .execute();

    const taskId = insertResult[0].id;

    // Delete the task
    const result = await deleteTask({ id: taskId });

    // Should return success
    expect(result.success).toBe(true);

    // Verify task is deleted from database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should return false when task does not exist', async () => {
    // Try to delete non-existent task
    const result = await deleteTask({ id: 999 });

    // Should return failure
    expect(result.success).toBe(false);
  });

  it('should not affect other tasks when deleting', async () => {
    // Create multiple tasks
    const insertResult1 = await db.insert(tasksTable)
      .values({
        name: 'Task 1',
        deadline: new Date('2024-12-31')
      })
      .returning()
      .execute();

    const insertResult2 = await db.insert(tasksTable)
      .values({
        name: 'Task 2',
        deadline: new Date('2024-12-31')
      })
      .returning()
      .execute();

    const task1Id = insertResult1[0].id;
    const task2Id = insertResult2[0].id;

    // Delete only the first task
    const result = await deleteTask({ id: task1Id });

    expect(result.success).toBe(true);

    // Verify first task is deleted
    const deletedTasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task1Id))
      .execute();

    expect(deletedTasks).toHaveLength(0);

    // Verify second task still exists
    const remainingTasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task2Id))
      .execute();

    expect(remainingTasks).toHaveLength(1);
    expect(remainingTasks[0].name).toEqual('Task 2');
  });
});
