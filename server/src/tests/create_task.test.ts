
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTaskInput = {
  name: 'Test Task',
  deadline: new Date('2024-12-31T23:59:00Z')
};

describe('createTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a task', async () => {
    const result = await createTask(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Task');
    expect(result.deadline).toEqual(testInput.deadline);
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save task to database', async () => {
    const result = await createTask(testInput);

    // Query using proper drizzle syntax
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].name).toEqual('Test Task');
    expect(tasks[0].deadline).toEqual(testInput.deadline);
    expect(tasks[0].completed).toEqual(false);
    expect(tasks[0].created_at).toBeInstanceOf(Date);
  });

  it('should create task with different deadline', async () => {
    const differentInput: CreateTaskInput = {
      name: 'Another Task',
      deadline: new Date('2025-01-15T10:30:00Z')
    };

    const result = await createTask(differentInput);

    expect(result.name).toEqual('Another Task');
    expect(result.deadline).toEqual(differentInput.deadline);
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
  });
});
