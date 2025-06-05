export interface Invoice {
    invoiceId: number,
    invoiceCode: string,
    fullName: string,
    id?: number,
    isNew?: boolean,
    examinationDate: string,
    drugsFee: number,
    examFee: number
}