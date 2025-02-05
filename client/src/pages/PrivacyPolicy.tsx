import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

interface ContentSection {
  subtitle?: string;
  text?: string;
  list?: string[];
}

interface Section {
  title: string;
  content: ContentSection[];
}

export const Terms = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper function to make URLs clickable
  const makeLinksClickable = (text: string) => {
    // Special handling for items with "Privacy Policy:" format
    if (text.includes("Privacy Policy:")) {
      const [prefix, urlPart] = text.split(": ");
      // Remove trailing parenthesis if it exists
      const url = urlPart.replace(/\)$/, "");
      return (
        <>
          {prefix}:{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {url}
          </a>
          {urlPart.endsWith(")") ? ")" : ""}
        </>
      );
    }

    // Regular URL handling for other cases
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-transparent hover:text-primary"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Last updated: February 04, 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-card rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Welcome to Not Alone!
              </h2>
              <p className="text-muted-foreground">
                Not Alone (the "Service," "Platform," "we," "us," or "our") is a
                comprehensive solution for connecting Lone Soldiers
                ("Soldiers"), Donors, Municipalities (Cities), Nonprofit
                Organizations, and Businesses, along with Admins who oversee the
                platform. This Privacy Policy explains how we collect, use, and
                disclose information about you when you use our website, mobile
                application, or any other online products and services that link
                to this Privacy Policy (collectively, the "Service").
              </p>
              <p className="text-muted-foreground mt-4">
                By accessing or using the Service, you agree to this Privacy
                Policy. If you do not agree, please do not access or use the
                Service.
              </p>
            </div>

            {sections.map((section, index) => (
              <div key={index} className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  {section.title}
                </h2>
                {section.content.map((content, i) => (
                  <div key={i} className="mb-6">
                    {content.subtitle && (
                      <h3 className="text-xl font-medium mb-3">
                        {content.subtitle}
                      </h3>
                    )}
                    {content.text && (
                      <p className="text-muted-foreground mb-4">
                        {makeLinksClickable(content.text)}
                      </p>
                    )}
                    {content.list && (
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                        {content.list.map((item, j) => (
                          <li key={j}>{makeLinksClickable(item)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="bg-card rounded-lg p-6 mt-12">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions or concerns about this Privacy Policy
                or our data practices, please contact us:
              </p>
              <p className="text-primary mt-2">
                <a
                  href="mailto:shalev396@gmail.com"
                  className="hover:underline"
                >
                  Email: shalev396@gmail.com
                </a>
              </p>
            </div>

            <div className="text-center mt-12 text-xl font-semibold text-primary">
              THANK YOU FOR USING NOT ALONE!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const sections: Section[] = [
  {
    title: "1. INTERPRETATION AND DEFINITIONS",
    content: [
      {
        subtitle: "1.1 Interpretation",
        text: "The words of which the initial letter is capitalized have meanings defined under the following conditions. The same definitions apply whether they appear in singular or plural.",
      },
      {
        subtitle: "1.2 Definitions",
        list: [
          "Account means a unique account created for You to access our Service or parts of our Service.",
          "Admin means a user with full permissions over the application. Admins approve or deny registrations for all other user types and can manage or override activities within the system.",
          "Affiliate means an entity that controls, is controlled by or is under common control with a party, where 'control' means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.",
          "Business means an organization registered on the Platform to provide discounts and services to Lone Soldiers. Business accounts can create business pages, manage special Soldier-only offers, and (in future releases) verify Soldier status in-person.",
          "City or Municipality (Municipality user) means a representative of a city who registers to manage Soldiers' financial requests, organize city-specific events ('Eatups'), and participate in the social network with Soldiers and Admins.",
          "Company (referred to as either 'the Company', 'We', 'Us' or 'Our' in this Agreement) refers to Not Alone.",
          "Cookies are small files placed on Your computer, mobile device, or any other device by a website, containing the details of Your browsing history and other usage patterns.",
          "Country refers to Israel.",
          "Device means any device that can access the Service such as a computer, a cellphone, or a digital tablet.",
          "Donor means an individual or entity who registers to donate items or money to Lone Soldiers. Donors can view approved Soldier financial requests and may organize Eatups, but they do not participate in the social feed.",
          "Lone Soldier (Soldier) means a user who can submit financial requests, join Eatups, and participate in the limited social network with Municipalities, Nonprofits, and Admins. Each Soldier's registration must be approved by an Admin, and Soldiers can be associated with multiple cities or none.",
          "Nonprofit means an organization that registers to support Lone Soldiers by organizing Eatups or other events and participating in the social network.",
          "Personal Data is any information that relates to an identified or identifiable individual.",
          "Service Provider means any natural or legal person who processes the data on behalf of the Company. This includes third-party companies or individuals employed by the Company to facilitate the Service, provide functionality on Our behalf, or assist in analyzing how the Service is used.",
          "Usage Data refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).",
          "Website refers to Not Alone, accessible from https://notalonesoldier.com",
          "You means the individual accessing or using the Service, or the company or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.",
        ],
      },
    ],
  },
  {
    title: "2. OVERVIEW OF THE NOT ALONE PLATFORM",
    content: [
      {
        text: "Not Alone is a comprehensive platform designed for Lone Soldiers and the people and organizations who want to support them. User types include: Lone Soldier (Soldier), Donor, Municipality (City Representative), Nonprofit Organization, Business, and Admin. All user types (except Admin) require registration and Admin approval before accessing the Service.",
      },
      {
        subtitle: "Key Features",
        list: [
          "Financial Requests: Soldiers can create requests, which are reviewed by Municipality users or Admins. Approved requests become visible to Donors, who can fulfill them monetarily.",
          "Eatups (Events): Organized by Nonprofits, Municipalities, or Donors. Soldiers may join these events. Visibility depends on who creates the event (city-specific, all Soldiers, etc.).",
          "Donations of Items: Donors can offer items like furniture or appliances. Municipalities or Admins coordinate item assignment to Soldiers.",
          "Discounts from Businesses: Businesses create dedicated pages to offer deals to verified Lone Soldiers.",
          "Social Network (Limited): Available to Soldiers, Municipalities, Nonprofits, and Admins. Used for posting updates, sharing events, etc. Donors and Businesses do not participate in the social feed.",
          "Messaging System: Event participants get a dedicated chat channel. Channels remain open throughout the event (with possible changes in future releases).",
        ],
      },
    ],
  },
  {
    title: "3. COLLECTING AND USING YOUR PERSONAL DATA",
    content: [
      {
        subtitle: "3.1 Types of Data Collected",
        text: "We collect various types of data to provide and improve our Service:",
      },
      {
        subtitle: "3.1.1 Personal Data",
        text: "We may ask You to provide certain personally identifiable information (e.g., name, email address, phone number) that can be used to contact or identify You.",
        list: [
          "Soldiers: may provide city affiliations, financial request details, and any necessary documentation for verification.",
          "Donors: may provide payment information for monetary donations or details about item donations.",
          "Municipalities: city affiliation and official representative status.",
          "Nonprofits: organization details to verify legitimacy and event management information.",
          "Businesses: business name, address, discount offerings, employee accounts (for future in-person Soldier verification).",
          "Admin: has full permissions but typically uses existing Not Alone credentials.",
        ],
      },
      {
        subtitle: "3.1.2 Usage Data",
        text: "Usage Data is collected automatically. This may include Your Device's IP address, browser type, pages of the Service You visit, and other diagnostic data. On mobile, we may collect unique device IDs, operating system information, and mobile Internet browser types.",
      },
      {
        subtitle: "3.1.3 Tracking Technologies and Cookies",
        text: "We use Cookies and similar tracking technologies (beacons, tags, scripts) to collect and analyze information. You can instruct Your browser to refuse all Cookies, but some functionalities may be limited.",
        list: [
          "Necessary / Essential Cookies: Required for providing core functionalities and security.",
          "Cookies Policy / Notice Acceptance Cookies: Track Your cookie preferences.",
          "Functionality Cookies: Remember Your choices and preferences.",
          "Analytics Cookies: Help us understand how the Service is used.",
        ],
      },
    ],
  },
  {
    title: "4. HOW WE USE YOUR PERSONAL DATA",
    content: [
      {
        text: "We use Your Personal Data for various purposes:",
        list: [
          "Providing and Maintaining the Service: Managing user registrations and facilitating role-based actions.",
          "Managing Financial Requests: Processing Soldier requests and donor fulfillment.",
          "Events (Eatups): Enabling event creation, management, and participation.",
          "Social Network: Facilitating communication between authorized users.",
          "Communication: Sending notifications and responding to inquiries.",
          "Business Operations: Analyzing and improving the Service.",
          "Legal and Compliance: Meeting legal obligations and protecting rights.",
          "Business Transfers: Handling organizational changes.",
        ],
      },
    ],
  },
  {
    title: "5. SHARING YOUR PERSONAL DATA",
    content: [
      {
        text: "We may share Your Personal Data in these situations:",
        list: [
          "With Service Providers: For analysis, infrastructure, and communications.",
          "With Other Users: Based on role-specific access needs.",
          "For Business Transactions: During mergers, acquisitions, or sales.",
          "With Affiliates: Subject to this Privacy Policy.",
          "With Your Consent: For purposes you explicitly approve.",
          "Legal Requirements: When legally obligated.",
        ],
      },
    ],
  },
  {
    title: "6. DATA RETENTION AND SECURITY",
    content: [
      {
        text: "We retain Your Personal Data only as long as necessary for the stated purposes. We implement appropriate security measures but cannot guarantee absolute security.",
      },
    ],
  },
  {
    title: "7. SERVICE PROVIDERS AND THIRD-PARTY TOOLS",
    content: [
      {
        text: "We use trusted third-party services:",
        list: [
          "AWS (Privacy Policy: https://aws.amazon.com/privacy/)",
          "MongoDB (Privacy Policy: https://www.mongodb.com/legal/privacy/privacy-policy)",
        ],
      },
    ],
  },
  {
    title: "8. CHILDREN'S PRIVACY",
    content: [
      {
        text: "Our Service does not address anyone under the age of 13. We do not knowingly collect Personal Data from children under 13. If You are a parent or guardian and become aware that Your child has provided Us with Personal Data, please contact Us. If We learn we have collected Personal Data from anyone under the age of 13 without verification of parental consent, We will take steps to remove that information from our servers.",
      },
    ],
  },
  {
    title: "9. CHANGES TO THIS PRIVACY POLICY",
    content: [
      {
        text: "We may update Our Privacy Policy from time to time. We will notify You of any material changes by posting the new Privacy Policy on this page and updating the 'Last updated' date. You are advised to review this Privacy Policy periodically for any updates or changes.",
      },
    ],
  },
];

export default Terms;
