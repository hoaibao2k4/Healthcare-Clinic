import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { publicRoutes } from "./routes/route";
import { Fragment } from "react";
import DefaultLayout from "./components/layouts/DefaultLayout";
import { ToastContainer } from "react-toastify";
import PrivateRouter from "./middleware";

function App() {
  return (
    <Router>
      <div className="health-clinic">
        <Routes>
          {publicRoutes.map((route, index) => {
            const Layout = route.layout === null ? Fragment : DefaultLayout;
            const Page = route.component;

            const element = (
              <Layout>
                <Page />
              </Layout>
            );

            const isLoginRoute = route.path === "/login";

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  isLoginRoute ? (
                    element
                  ) : (
                    <PrivateRouter>{element}</PrivateRouter>
                  )
                }
              />
            );
          })}
        </Routes>

        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
