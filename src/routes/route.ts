import DefaultLayout from "@/components/layouts/DefaultLayout";
import DashBoard from "@/pages/Dashboard";
import DiseasePage from "@/pages/Disease";
import DrugsPage from "@/pages/Drugs";
import DrugUnitPage from "@/pages/Drugs Unit";
import LoginPage from "@/pages/Login";
import PatientExam from "@/pages/Patient Exam";
import PatientList from "@/pages/Patients";
import PatientRecords from "@/pages/Records";


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
]
export {publicRoutes}