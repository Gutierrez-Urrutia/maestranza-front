export interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  roles: string[]; 
}