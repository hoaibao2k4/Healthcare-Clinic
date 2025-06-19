import { Drug } from "./drug"

export interface ExaminationDetail {
    drugs: Drug,
    quantity: number,
    note: string,
    id?: string,
    isNew?: boolean,
    drugId?: number,
    drugName?: string,
    unitName?: string,
}

export interface Record {
    examId?: string,
    examinationDate: string,
    symptoms: string,
    diseaseName: string,
    examinationDetails: ExaminationDetail[]
}