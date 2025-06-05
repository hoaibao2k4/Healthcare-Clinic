import { Drug } from "./drug"

export interface ExaminationDetail {
    drugs: Drug,
    quantity: number,
    note: string,
    id?: string,
    isNew?: boolean,
    drugId?: number
}