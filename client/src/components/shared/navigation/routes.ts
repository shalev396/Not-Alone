import { RouteProps, AdminRouteSection } from "./types";

export const routeListLanding: RouteProps[] = [
  {
    href: "#about",
    label: "About us",
  },
  {
    href: "#howItWorks",
    label: "How It Works",
  },
  {
    href: "#services",
    label: "Services",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const routeListSoldier: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/requestForm",
    label: "Request Form #",
    hideInNavbar: true,
  },
  {
    href: "/my-requests",
    label: "My Requests",
    hideInNavbar: true,
  },
  {
    href: "/my-donations",
    label: "My Donations",
  },
  {
    href: "/social",
    label: "Social",
  },
  {
    href: "/create-post",
    label: "Create Post",
    hideInNavbar: true,
  },
  {
    href: "/home/eatup",
    label: "EatUps",
  },
  {
    href: "/vouchers",
    label: "Vouchers@",
    hideInNavbar: true,
  },
  {
    label: "Deals", 
    href: "/deals",
  },
  {
    href: "/rights",
    label: "Your Rights",
  },
  {
    href: "/soldier-join-city",
    label: "Join City #",
    hideInNavbar: true,
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListMunicipality: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/contribute",
    label: "Answer Requests",
    requiresCityOrAdmin: true,
    hideInNavbar: true,
  },
  {
    href: "/social",
    label: "Social",
  },
  {
    href: "/create-post",
    label: "Create Post",
    hideInNavbar: true,
    requiresCityOrAdmin: false, 
  },
  {
    href: "/donation-assignment",
    label: "Donation Assignment",
    requiresCityOrAdmin: true,
  },
  {
    href: "/donation-control-panel",
    label: "Donation Control Panel",
    requiresCityOrAdmin: true,
  },

  {
    href: "/new-post",
    label: "Create Event",
  },
  {
    href: "/my-eatups",
    label: "My EatUps",
  },
  {
    href: "/city-requests",
    label: "City Requests",
    requiresCityOrAdmin: true,
  },
  {
    href: "/create-city",
    label: "Create City",
  },
  {
    href: "/city-approval",
    label: "City Approval",
    requiresCityOrAdmin: true,
  },
  {
    href: "/join-city",
    label: "Join City",
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListDonor: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/contribute",
    label: "Pay Requests",
  },

  {
    href: "/create-donation",
    label: "Create Donation",
  },
  {
    href: "/donation-status",
    label: "Donation Status",
  },
  {
    href: "/my-donations",
    label: "My Donations",
  },

  {
    href: "/new-post",
    label: "Create EatUp",
  },
  {
    href: "/my-eatups",
    label: "My EatUps",
  },

  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListOrganization: RouteProps[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/social",
    label: "Social",
  },
  {
    href: "/new-post",
    label: "Create Event",
  },
  {
    href: "/my-eatups",
    label: "My EatUps",
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  },
];

export const routeListBusiness: RouteProps[] = [
  {
    href: "/create-deal",
    label: "Create Deal",
  },
  {
    label: "My Deals",
    href: "/my-deals",
  },
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/discounts",
    label: "Add Discount @",
    hideInNavbar: true,
  },
  {
    href: "/verify-soldier",
    label: "Verify Soldier @",
    hideInNavbar: true,
  },
  {
    href: "/profile",
    label: "Profile",
  },
  {
    href: "/logout",
    label: "Logout",
  }
  
];

export const routeListAdmin: AdminRouteSection[] = [
  {
    section: "Admin Panel",
    routes: [
      {
        href: "/admin/queue",
        label: "Signup Queue",
      },
      {
        href: "/admin/users",
        label: "Manage Users @",
      },
      {
        href: "/admin/posts",
        label: "Manage Posts @",
      },
      {
        href: "/admin/cities",
        label: "Manage Cities",
      },
      {
        href: "/admin/vouchers",
        label: "Manage Vouchers @",
      },
    ],
  },
  {
    section: "Soldier Features",
    routes: routeListSoldier,
  },
  {
    section: "Municipality Features",
    routes: routeListMunicipality,
  },
  {
    section: "Donor Features",
    routes: routeListDonor,
  },
  {
    section: "Organization Features",
    routes: routeListOrganization,
  },
  {
    section: "Business Features",
    routes: routeListBusiness,
  },
  {
    section: "Common",
    routes: [
      {
        href: "/",
        label: "Home",
      },
      {
        href: "/profile",
        label: "Profile",
      },
      {
        href: "/logout",
        label: "Logout",
      },
    ],
  },
];
