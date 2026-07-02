import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	describe('getTasks', () => {
		it('returns array of tasks', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve([mockTask]),
				})
			);

			const tasks = await getTasks();
			expect(tasks).toEqual([mockTask]);
			expect(fetch).toHaveBeenCalledWith('/api/tasks');
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 500,
					text: () => Promise.resolve('Internal Server Error'),
				})
			);

			await expect(getTasks()).rejects.toThrow('HTTP 500');
		});
	});

	describe('createTask', () => {
		it('sends POST and returns created task', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve(mockTask),
				})
			);

			const result = await createTask({ title: 'Test' });

			expect(result).toEqual(mockTask);
			expect(fetch).toHaveBeenCalledWith(
				'/api/tasks',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: 'Test' }),
				})
			);
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 400,
					text: () => Promise.resolve('Bad Request'),
				})
			);

			await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400');
		});
	});

	describe('updateTask', () => {
		it('sends PUT and returns updated task', async () => {
			const updated = { ...mockTask, completed: true };
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve(updated),
				})
			);

			const result = await updateTask(1, { completed: true });

			expect(result).toEqual(updated);
			expect(fetch).toHaveBeenCalledWith(
				'/api/tasks/1',
				expect.objectContaining({
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ completed: true }),
				})
			);
		});

		it('throws on HTTP 404', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 404,
					text: () => Promise.resolve('Not Found'),
				})
			);

			await expect(updateTask(999, { completed: true })).rejects.toThrow('HTTP 404');
		});
	});

	describe('deleteTask', () => {
		it('sends DELETE request', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
				})
			);

			await deleteTask(1);

			expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'DELETE' }));
		});

		it('throws on HTTP error', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 404,
					text: () => Promise.resolve('Not Found'),
				})
			);

			await expect(deleteTask(999)).rejects.toThrow('HTTP 404');
		});
	});
});
