export interface Patient {
    patientId?: string,
    fullName: string,
    gender: boolean,
    yearOfBirth: string,
    address: string,
    phoneNumber: string,
    residentalIdentity: string,
    isNew?: boolean,
    id?: string
}