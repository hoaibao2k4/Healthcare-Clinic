export interface Doctor {
  doctorId?: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  specialization: string;
  qualification: string;
  yearsOfExperience: number;
  id?: number;
  isNew?: boolean;
  roles: string[];
}
