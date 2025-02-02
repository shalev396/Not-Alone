import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { RootState } from "@/Redux/store";
import { api } from "@/api/api";
import {
  routeListSoldier,
  routeListMunicipality,
  routeListDonor,
  routeListOrganization,
  routeListBusiness,
  routeListAdmin,
} from "./navigation/routes";
import { RouteProps, AdminRouteSection } from "./navigation/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const currentPath = window.location.pathname;
  const [isLoading, setIsLoading] = useState(true);

  // Always declare the query, but control its execution with enabled flag
  const { data: userCity = [], isLoading: isCityLoading } = useQuery({
    queryKey: ["user-city"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/me");
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch user city:", error);
        return [];
      }
    },
    enabled:
      !!user.email && (user.type === "Municipality" || user.type === "Admin"),
  });

  // Function to check if a path is in a route list
  const isPathInRouteList = (routeList: any[]): boolean => {
    return routeList.some((route) => {
      if ("routes" in route) {
        // Handle admin sections that contain nested routes
        return route.routes?.some((r: any) => r.href === currentPath);
      }
      return route.href === currentPath;
    });
  };

  // Function to filter routes based on city membership
  const filterRoutesByAccess = (
    routes: (RouteProps | AdminRouteSection)[]
  ): (RouteProps | AdminRouteSection)[] => {
    // If user is not Municipality or Admin, filter out routes that require city access
    if (user.type !== "Municipality" && user.type !== "Admin") {
      return routes
        .filter((route) => {
          if ("routes" in route && route.routes) {
            const filteredRoutes = route.routes.filter(
              (r) => !r.requiresCityOrAdmin
            );
            return filteredRoutes.length > 0
              ? { ...route, routes: filteredRoutes }
              : null;
          }
          return !route.requiresCityOrAdmin;
        })
        .filter(
          (route): route is RouteProps | AdminRouteSection => route !== null
        );
    }

    // For Municipality and Admin users, check city membership
    return routes
      .map((route) => {
        if ("routes" in route && route.routes) {
          const filteredRoutes = route.routes.filter(
            (r) =>
              !r.requiresCityOrAdmin ||
              user.type === "Admin" ||
              (Array.isArray(userCity) && userCity.length > 0)
          );
          return filteredRoutes.length > 0
            ? { ...route, routes: filteredRoutes }
            : null;
        }
        if (
          "requiresCityOrAdmin" in route &&
          route.requiresCityOrAdmin &&
          user.type !== "Admin" &&
          (!Array.isArray(userCity) || userCity.length === 0)
        ) {
          return null;
        }
        return route;
      })
      .filter(
        (route): route is RouteProps | AdminRouteSection => route !== null
      );
  };

  // Function to get allowed routes based on user type
  const getAllowedRoutes = (
    userType: string
  ): (RouteProps | AdminRouteSection)[] => {
    let routes: (RouteProps | AdminRouteSection)[];
    switch (userType?.toLowerCase()) {
      case "admin":
        routes = routeListAdmin;
        break;
      case "soldier":
        routes = routeListSoldier;
        break;
      case "municipality":
        routes = routeListMunicipality;
        break;
      case "donor":
        routes = routeListDonor;
        break;
      case "organization":
        routes = routeListOrganization;
        break;
      case "business":
        routes = routeListBusiness;
        break;
      default:
        routes = [];
    }
    return filterRoutesByAccess(routes);
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await api.get("/users/me");
      dispatch({ type: "user/setUser", payload: response.data.user });
      return true;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      sessionStorage.removeItem("token");
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        navigate("/login");
        return;
      }

      // If we have a token but no user data (after refresh)
      if (token && !user.email) {
        const success = await fetchUserData();
        if (!success) {
          navigate("/login");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !user.email) {
      navigate("/login");
      return;
    }

    // Only check city data for Municipality users
    const shouldCheckCityData =
      user.type === "Municipality" || user.type === "Admin";
    const isLoadingComplete =
      !isLoading && (!shouldCheckCityData || !isCityLoading);

    if (isLoadingComplete && user.email) {
      const allowedRoutes = getAllowedRoutes(user.type || "");
      const publicPaths = ["/", "/profile", "/logout"];
      const isPublicPath =
        publicPaths.includes(currentPath) ||
        currentPath.startsWith("/channel/");

      if (isPublicPath) return;

      let isAllowed = isPathInRouteList(allowedRoutes);

      if (isAllowed) {
        const flattenedRoutes = allowedRoutes.reduce(
          (acc: RouteProps[], route) => {
            if ("routes" in route) {
              return [...acc, ...(route.routes || [])];
            }
            return [...acc, route as RouteProps];
          },
          []
        );

        const currentRoute = flattenedRoutes.find(
          (route) => route.href === currentPath
        );

        if (currentRoute?.requiresCityOrAdmin) {
          if (user.type !== "Municipality" && user.type !== "Admin") {
            isAllowed = false;
          } else if (user.type === "Municipality") {
            isAllowed = Array.isArray(userCity) && userCity.length > 0;
          }
        }
      }

      if (!isAllowed) {
        console.log(`Access denied: ${user.type} cannot access ${currentPath}`);
        navigate("/");
      }
    }
  }, [
    currentPath,
    user?.email,
    user?.type,
    isLoading,
    isCityLoading,
    userCity,
  ]);

  if (isLoading || (user.type === "Municipality" && isCityLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user.email) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
