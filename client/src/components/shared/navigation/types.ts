export interface RouteProps {
  href: string;
  label: string;
  requiresCityOrAdmin?: boolean;
}

export interface AdminRouteSection {
  section?: string;
  routes?: RouteProps[];
  href?: string;
  label?: string;
  requiresCityOrAdmin?: boolean;
}

export interface NavbarProps {
  isVertical?: boolean;
  isAccordion?: boolean;
  modes: string;
}
