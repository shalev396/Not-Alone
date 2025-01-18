import { useNavigate } from "react-router-dom"; // כדי לנהל את הניווט לדף הבית

function PrivacyPolicy() {
  const navigate = useNavigate(); // ה-hook של ניווט לדפים

  // פונקציה להחזרה לדף הבית
  const goToHome = () => {
    navigate("/"); // משנה את הנתיב לדף הבית
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center items-center">
      <div className="card bg-card text-card-foreground rounded-lg shadow-md w-full max-w-3xl p-6">
        <div className="card-header">
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
        </div>
        <div className="card-content mt-4">
          <h3 className="text-xl font-semibold">Introduction</h3>
          <p>
            Welcome to our platform designed to assist lone soldiers. We are
            committed to protecting your privacy and safeguarding your personal
            information. This Privacy Policy explains how we collect, use, and
            protect your data when you interact with our website.
          </p>
          <h3 className="text-xl font-semibold mt-4">Data Collection</h3>
          <p>
            We collect the following information when you sign up for our
            platform:
          </p>
          <ul className="list-disc pl-5">
            <li>Name</li>
            <li>Email</li>
            <li>Phone number</li>
            <li>Location</li>
            <li>Any other details you provide when filling out the forms</li>
          </ul>
          <p>
            This information is used to provide better services to our users.
          </p>
          <h3 className="text-xl font-semibold mt-4">
            Data Protection and Security
          </h3>
          <p>
            We take your privacy seriously and implement various security
            measures to protect your data, including:
          </p>
          <ul className="list-disc pl-5">
            <li>Encryption of personal data during transmission</li>
            <li>Two-factor authentication for account access</li>
            <li>
              Regular security audits to ensure the safety of your information
            </li>
          </ul>
          <p>
            All sensitive data, such as passwords, is securely stored and never
            shared with third parties without your consent.
          </p>
          <h3 className="text-xl font-semibold mt-4">User Responsibilities</h3>
          <p>
            As a user, you are responsible for maintaining the confidentiality
            of your account credentials. We encourage you to use strong
            passwords and to report any suspicious activity to our support team
            immediately.
          </p>
          <h3 className="text-xl font-semibold mt-4">How We Use Your Data</h3>
          <p>
            The data we collect is used solely for the purpose of improving your
            experience on our platform, including:
          </p>
          <ul className="list-disc pl-5">
            <li>Communicating with you about your account and services</li>
            <li>Providing personalized support and recommendations</li>
            <li>Improving our platform and its features</li>
          </ul>
          <p>We do not sell or share your data with any third parties.</p>
          <h3 className="text-xl font-semibold mt-4">Changes to This Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. Any changes will
            be communicated via our platform. We recommend that you periodically
            review this policy to stay informed about how we protect your data.
          </p>
          {/* כפתור חזרה לדף הבית */}
          <div className="mt-6 text-center">
            <button
              onClick={goToHome}
              className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-foreground transition duration-200"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
