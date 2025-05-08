import DefaultLayout from "@/components/layouts/DefaultLayout";
import DashBoard from "@/pages/Dashboard";
import DiseasePage from "@/pages/Disease";
import DrugsPage from "@/pages/Drugs";
import DrugUnitPage from "@/pages/Drugs Unit";
import DrugUsagePage from "@/pages/DrugUsage";
import InvoicePage from "@/pages/Invoice";
import LoginPage from "@/pages/Login";
import PatientExam from "@/pages/Patient Exam";
import PatientList from "@/pages/Patients";
import PatientRecords from "@/pages/Records";
import RevenuePage from "@/pages/Revenue";


const publicRoutes = [
    {path: '/', component: DashBoard, layout: DefaultLayout},
    {path: '/dashboard', component: DashBoard, layout: DefaultLayout},
    {path: '/exams', component: PatientExam, layout: DefaultLayout},
    {path: '/records', component: PatientRecords, layout: DefaultLayout},
    {path: '/patients', component: PatientList, layout: DefaultLayout},
    {path: '/login', component: LoginPage, layout: null},
    {path: '/drugs/drugs-unit', component: DrugUnitPage, layout: DefaultLayout},
    {path: '/drugs/disease', component: DiseasePage, layout: DefaultLayout},
    {path: '/drugs/drugs-type', component: DrugsPage, layout: DefaultLayout},
    {path: '/invoice', component: InvoicePage, layout: DefaultLayout},
    {path: '/reports/revenue', component: RevenuePage, layout: DefaultLayout},
    {path: '/reports/drug-usage', component: DrugUsagePage, layout: DefaultLayout},



]
export {publicRoutes}