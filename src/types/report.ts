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
    id?:string,
    dayReportId: number,
    date: string,
    numberOfPatients: number,
    revenue: number,
    ratio: number,
    isNew?: boolean
}

export interface DrugReport {
    reportUsageId: number,
    drug: Drug,
    month: number,
    year: number,
    usageNumber: number
}
export interface DrugUsageRow {
  id: number;
  drugId: number;
  drugName: string;
  unitName: string;
  usedNumber: number;
  isNew?: boolean;
}