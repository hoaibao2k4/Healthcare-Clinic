export interface DrugUnit {
  id?: number;
  isNew?: boolean;
  unitId: string;
  unitName: string;
  description: string;
}

export interface Drug {
  id?: number;
  isNew?: boolean;
  drugId: string;
  drugName: string;
  description: string;
  quantity: number;
  importPrice: number;
  expirationDate: string;
  drugsUnit: DrugUnit;
  unitId?: string
}
