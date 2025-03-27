import DefaultLayout from "~/components/layouts/DefaultLayout";
import DashBoard from "~/pages/Dashboard";

const publicRoutes = [
    {path: '/', component: DashBoard, layout: DefaultLayout}
]
export {publicRoutes}