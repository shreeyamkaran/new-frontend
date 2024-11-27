import { RootState } from "@/redux/store";
import { Fragment, ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
}

interface MyToken {
    sub: string,
    role: string,
    iat: number,
    exp: number
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const token = useSelector((state: RootState) => state.user.token);

    if(!token) {
        return <Navigate to="/login" />
    }
    
    const decodedToken = jwtDecode<MyToken>(token);
    const userRole = decodedToken.role;

    if (requiredRole && userRole !== requiredRole) {
        // If a required role is set and the user doesn't have the correct role, redirect
        return <Navigate to="/" />;
    }

    // If the token is valid and the user has the right role, render the protected route
    return <Fragment>{children}</Fragment>;

}