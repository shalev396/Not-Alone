export interface RouteProps {
  href: string;
  label: string;
}

export interface AdminRouteSection {
  section?: string;
  routes?: RouteProps[];
  href?: string;
  label?: string;
}

export interface NavbarProps {
  isVertical?: boolean;
  isAccordion?: boolean;
  modes: string;
}
