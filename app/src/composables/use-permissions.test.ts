import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import { ref } from 'vue';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

beforeEach(() => {
	setActivePinia(
		createTestingPinia({
			createSpy: vi.fn,
			stubActions: false,
		})
	);
	vi.mock('');
});

import { useUserStore } from '@/stores/user';
import { usePermissionsStore } from '@/stores/permissions';
import { usePermissions } from './use-permissions';
import { useCollection } from '@directus/shared/composables';
import { Field } from '@directus/shared/types';

vi.mock('@directus/shared/composables');

const mockUser = {
	id: '00000000-0000-0000-0000-000000000000',
	role: {
		admin_access: false,
		id: '00000000-0000-0000-0000-000000000000',
	},
};
const mockReadPermissions = {
	role: '00000000-0000-0000-0000-000000000000',
	permissions: {
		_and: [
			{
				field_a: {
					_null: true,
				},
			},
			{
				field_b: {
					_null: true,
				},
			},
		],
	},
	validation: null,
	presets: null,
	fields: ['id', 'start_date', 'end_date'],
	collection: 'test',
	action: 'read',
};
const mockFields: Field[] = [
	{
		collection: 'test',
		field: 'id',
		name: 'id',
		type: 'integer',
		schema: null,
		meta: null,
	},
	{
		collection: 'test',
		field: 'name',
		name: 'name',
		type: 'string',
		schema: null,
		meta: null,
	},
	{
		collection: 'test',
		field: 'start_date',
		name: 'start_date',
		type: 'timestamp',
		schema: null,
		meta: null,
	},
	{
		collection: 'test',
		field: 'end_date',
		name: 'end_date',
		type: 'timestamp',
		schema: null,
		meta: null,
	},
];

vi.mock('@/api', () => {
	return {
		default: {
			get: (path: string) => {
				if (path === '/permissions') {
					return Promise.resolve({
						data: { data: [mockReadPermissions] },
					});
				}

				return Promise.reject(new Error(`GET "${path}" is not mocked in this test`));
			},
		},
	};
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('usePermissions', () => {
	test('Remove fields without read permissions', async () => {
		const userStore = useUserStore();
		userStore.currentUser = mockUser as any;

		const permissionsStore = usePermissionsStore();
		await permissionsStore.hydrate();

		useCollection.mockReturnValue({ info: ref(null), fields: ref(mockFields) });

		const { fields } = usePermissions(ref('test'), ref(null), ref(false));
		for (const field of fields.value) {
			expect(mockReadPermissions.fields.includes(field.field)).toBe(true);
		}
	});
});
