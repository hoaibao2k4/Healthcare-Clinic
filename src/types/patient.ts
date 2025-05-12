export interface Patient {
    patientId?: number,
    fullName: string,
    gender: boolean,
    yearOfBirth: string,
    address: string,
    phoneNumber?: string,
    residentalIdentity?: string,
    isNew?: boolean,
    id?: number,
    examId?: number
}

export interface PatientDiagnosis {
    examId: number,
    fullName: string,
    examinationDate: string,
    nameDisease: string,
    symptoms: string,
    isNew?: boolean,
    id?: number
}