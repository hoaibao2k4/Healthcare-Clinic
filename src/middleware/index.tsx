import { RootState } from "@/redux/store";
import { Permission } from "@/types";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

interface PrivateRouterProps {
  children: ReactNode;
}

export default function PrivateRouter({ children }: PrivateRouterProps) {
  const user = useSelector((state: RootState) => state.auth.login.currentUser);
  const permission = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );
  const location = useLocation();

  if (!user) {
    if (!permission) return <Navigate to="/login" />;
  }

  const currentSegment = location.pathname.split("/")[1] || "dashboard";

  if (
    currentSegment.includes("dashboard") ||
    currentSegment.includes("integrations")
  )
    return children;
  const adminAllowedSegments = [
    "staff",
    "admin",
    "invoice",
    "drugs",
    "reports",
  ];

  if (
    permission?.selected_role === "ADMIN" &&
    adminAllowedSegments.includes(currentSegment)
  ) {
    return children;
  }

  const isAllowed = permission?.permissionList.some((item: Permission) => {
    return (
      item.permission === currentSegment &&
      (item.can_read || item.can_create || item.can_update)
    );
  });
  console.log(isAllowed);
  if (!isAllowed) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
