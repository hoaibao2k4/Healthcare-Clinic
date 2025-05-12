export interface Invoice {
    fullName: string,
    id?: number,
    isNew?: boolean,
    examinationDate: string,
    drugsFee: number,
    examFee: number
}