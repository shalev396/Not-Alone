import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Section {
  title: string;
  content: string | string[];
  isList?: boolean;
}

export const Tos = () => {
  const navigate = useNavigate();

  const sections: Section[] = [
    {
      title: "Legal Agreement",
      content:
        "These terms and conditions ('Agreement') set forth the general terms and conditions of your use of the notalonesoldier.com website ('Website' or 'Service') and any of its related products and services (collectively, 'Services'). This Agreement is legally binding between you ('User', 'you' or 'your') and this Website operator ('Operator', 'we', 'us' or 'our'). If you are entering into this Agreement on behalf of a business or other legal entity, you represent that you have the authority to bind such entity to this Agreement. If you do not have such authority, or if you do not agree with the terms of this Agreement, you must not accept this Agreement and may not access and use the Website and Services.",
    },
    {
      title: "Overview of the Not Alone Platform",
      content:
        "Not Alone is a comprehensive platform designed for Lone Soldiers and the people and organizations who want to support them. The platform includes multiple user types—each with specific roles, permissions, and interactions—all of which require admin approval at registration.",
    },
    {
      title: "User Types",
      isList: true,
      content: [
        "Lone Soldier (Soldier): Can submit financial requests, join events, and participate in the social network. Must be approved by Admin and can be associated with multiple cities.",
        "Donor: Can donate items or money, view approved requests, and organize events. Does not participate in the social network.",
        "Municipality (City Representative): Manages city-specific requests and events, approves Soldier requests, and participates in the social network.",
        "Nonprofit Organization: Creates events, supports Soldiers, and participates in the social network.",
        "Business: Provides discounts and services to verified Soldiers. Does not participate in the social network.",
        "Admin: Has full platform permissions, approves registrations, and manages all platform activities.",
      ],
    },
    {
      title: "Accounts and Membership",
      content: [
        "Account creation requires accurate and complete information. Providing false contact information may result in account termination.",
        "All new registrations require Admin approval before access.",
        "You are responsible for maintaining account security and must immediately notify us of any unauthorized use.",
        "We may monitor and review new accounts before allowing access to the Services.",
        "We may suspend, disable, or delete accounts that violate our terms.",
        "If we delete your account for violations, you may not re-register and we may block your email and IP address.",
        "We are not liable for any acts or omissions by you, including damages incurred as a result of such acts.",
      ],
    },
    {
      title: "User Content",
      content: [
        "We do not own any Content that you submit on the Website.",
        "You are solely responsible for the accuracy, quality, integrity, and legality of all submitted Content.",
        "You grant us permission to access, copy, distribute, store, transmit, reformat, display and perform your Content as needed to provide the Services.",
        "We may monitor and remove any Content that violates our policies or is harmful.",
        "You grant us license to use your Content for commercial and marketing purposes.",
        "Social network access is limited to specific user types.",
        "Event messaging channels may be closed at our discretion.",
      ],
    },
    {
      title: "Backups and Data",
      content: [
        "We are not responsible for Content residing on the Website.",
        "We are not liable for any loss of Content.",
        "You are responsible for maintaining appropriate backups of your Content.",
        "In certain circumstances, we may be able to restore deleted data from our backups, but this is not guaranteed.",
      ],
    },
    {
      title: "Links to Other Resources",
      content:
        "Although the Website may link to other resources, we do not imply any approval, association, sponsorship, endorsement, or affiliation with any linked resource, unless specifically stated. We are not responsible for examining or evaluating the content or accuracy of third-party resources. Your use of third-party resources is at your own risk.",
    },
    {
      title: "Prohibited Uses",
      isList: true,
      content: [
        "Using the Website for any unlawful purpose",
        "Soliciting others to perform unlawful acts",
        "Violating any international, federal, provincial or state regulations",
        "Infringing upon intellectual property rights",
        "Harassment, abuse, or discrimination of any kind",
        "Submitting false or misleading information",
        "Uploading malware or malicious code",
        "Spamming, phishing, or scraping activities",
        "Interfering with security features",
        "Using the platform for obscene or immoral purposes",
      ],
    },
    {
      title: "Severability",
      content:
        "If any provision of this Agreement is held to be illegal, invalid, or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect. The Agreement will be limited only to the extent necessary to make it legal and enforceable.",
    },
    {
      title: "Changes and Amendments",
      content:
        "We reserve the right to modify these terms at any time. Changes will be posted with an updated date, and where feasible, we will notify you via email or other means. Continued use after changes constitutes acceptance of the modifications.",
    },
    {
      title: "Contact Us",
      content:
        "If you have any questions, concerns, or complaints regarding these Terms and Conditions, please contact us at shalev396@gmail.com",
    },
  ];

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
            Terms and <span className="text-primary">Conditions</span>
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Last updated: February 04, 2025
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-card rounded-lg p-6 mb-8">
              <p className="text-muted-foreground">
                By accessing and using the Website and Services, you acknowledge
                that you have read, understood, and agree to be bound by the
                terms of this Agreement. You acknowledge that this Agreement is
                a contract between you and the Operator, even though it is
                electronic and is not physically signed by you, and it governs
                your use of the Website and Services.
              </p>
            </div>

            {sections.map((section, index) => (
              <div key={index} className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  {section.title}
                </h2>
                {section.isList ? (
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                    {(section.content as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    {section.content as string}
                  </p>
                )}
              </div>
            ))}

            <div className="text-center mt-12 text-xl font-semibold text-primary">
              THANK YOU FOR USING NOT ALONE!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tos;
