import { RootState } from "@/redux/store";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface PrivateRouterProps {
  children: ReactNode;
}

export default function PrivateRouter({ children }: PrivateRouterProps) {
  const user = useSelector((state: RootState) => state.auth.login.currentUser);
  const permission = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );
  if (!user) {
    if (!permission) return <Navigate to="/login" />;
  }

  return children;
}
