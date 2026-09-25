import type { Role } from './';

export interface RoomAccess {
  email: string;
  role: Role;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  accessList: RoomAccess[]; 
}