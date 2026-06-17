import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth";
import { UserType } from "@/types";

interface Props {
  userType?: UserType[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ userType, children }: Props) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate replace to="/login" />;
  }

  if (userType && !userType.includes(user.tipo)) {
    return <Navigate replace to="/dashboard" />;
  }

  return children ? children : <Outlet />;
}
