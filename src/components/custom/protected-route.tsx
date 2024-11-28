import { Fragment, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Unauthorised from "../pages/unauthorised";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
    disallowedRole?: string; // Add this prop to check for disallowed roles
}

interface MyToken {
    sub: string;
    role: string;
    iat: number;
    exp: number;
}

export default function ProtectedRoute({ children, requiredRole, disallowedRole }: ProtectedRouteProps) {
    const token = localStorage.getItem("jwt");
    const location = useLocation();

    if(!token) {
        return <Navigate to="/login" />
    }
    

    const decodedToken = jwtDecode<MyToken>(token);
    const userRole = decodedToken.role;

    // If the route has a disallowed role and the user's role matches, redirect
    if (disallowedRole && userRole === disallowedRole) {
        return <Unauthorised />;  // Redirect to home or any other page
    }

    // If a required role is set and the user doesn't have the correct role, redirect
    if (requiredRole && userRole !== requiredRole) {
        return <Unauthorised />;
    }

    // If the token is valid and no disallowed role is matched, render the protected route
    return <Fragment>{children}</Fragment>;
}
