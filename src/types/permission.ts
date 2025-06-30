export interface Permission {
  permission_id: number;
  permission?: string;
  can_create: boolean;
  can_update: boolean;
  can_read: boolean;
  can_delete: boolean;
  isNew?: boolean,
  id?: number,
  role?: string
}
