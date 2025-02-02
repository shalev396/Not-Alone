import { About } from "@/components/landing/About";
import { Cta } from "@/components/landing/Cta";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navbar } from "@/components/shared/Navbar";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { Services } from "@/components/landing/Services";
import { Sponsors } from "@/components/landing/Sponsors";
import { Team } from "@/components/landing/Team";
import { Testimonials } from "@/components/landing/Testimonials";
import { DisclaimerDialog } from "@/components/landing/DisclaimerDialog";
import "../App.css";

function Landing() {
  return (
    <>
      <DisclaimerDialog />
      <Navbar modes="landing" />
      {/*  */}
      <Hero />
      <Sponsors />
      <About />
      {/*  */}
      <HowItWorks />
      <Features />
      <Services />
      {/*  */}
      <Cta />
      <Testimonials />
      <Team />
      {/* <Pricing />
      <Newsletter /> */}
      <FAQ />
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default Landing;
