import { RootState } from "@/redux/store";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface PrivateRouterProps {
  children: ReactNode;
}

export default function PrivateRouter({ children }: PrivateRouterProps) {
  const user = useSelector((state: RootState) => state.auth.login.currentUser);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
