import { Drug } from "./drug"

export interface Revenue {
    id?: string
    monthReportId: number,
    month: number,
    year: string,
    totalRevenue: number,
    dayReports: DayReport[],
    isNew?: boolean
}

export interface DayReport {
    dayReportId: number,
    date: string,
    numberOfPatients: number,
    revenue: number,
    ratio: number
}

export interface DrugReport {
    reportUsageId: number,
    drug: Drug[],
    month: number,
    year: number,
    usageNumber: number
}