export interface Right {
  id: number;
  title: string;
  description: string;
  category: string;
}

export const rightsData: Right[] = [
  // Financial Benefits
  {
    id: 1,
    title: "Monthly Stipend",
    description: "A monthly stipend for lone soldiers, including combat bonuses and eligibility for grocery stipends.",
    category: "Financial Benefits",
  },
  {
    id: 2,
    title: "Holiday Gift Cards",
    description: "Gift cards provided twice a year during Rosh Hashana and Passover, valid at over 50 chain stores.",
    category: "Financial Benefits",
  },
  {
    id: 3,
    title: "Financial Support for Food Purchases",
    description: "A set monthly stipend for purchasing food at Shupersal stores across the country.",
    category: "Financial Benefits",
  },
  {
    id: 4,
    title: "Economic Allowance for Sick Leave",
    description: "An allowance of 26.7 NIS per day for sick leave after three consecutive sick days.",
    category: "Financial Benefits",
  },

  // Housing Benefits
  {
    id: 5,
    title: "Rent Assistance",
    description: "Monthly rent refund of up to 1,399 NIS, plus additional utilities coverage.",
    category: "Housing Benefits",
  },
  {
    id: 6,
    title: "Beit HaChayal (Soldiers’ House)",
    description: "Free housing with laundry and meals in specific facilities across the country.",
    category: "Housing Benefits",
  },
  {
    id: 7,
    title: "Lone Soldier Apartments",
    description: "Fully furnished apartments with additional food coupons (400 NIS monthly).",
    category: "Housing Benefits",
  },
  {
    id: 8,
    title: "Living in a Kibbutz",
    description: "Free housing with communal services and optional adoptive families.",
    category: "Housing Benefits",
  },

  // Leave and Vacation
  {
    id: 9,
    title: "Personal Errands Day",
    description: "One day every two months for errands, or monthly during training.",
    category: "Leave and Vacation",
  },
  {
    id: 10,
    title: "Special Leave for Moving",
    description: "Two days annually for moving apartments.",
    category: "Leave and Vacation",
  },
  {
    id: 11,
    title: "Leave for Parents Visiting Israel",
    description: "Up to 8 days annually during mandatory service.",
    category: "Leave and Vacation",
  },
  {
    id: 12,
    title: "Leave to Visit Parents Abroad",
    description: "Up to 30 days of leave annually to visit parents abroad.",
    category: "Leave and Vacation",
  },
  {
    id: 13,
    title: "Early Leave on Weekends or Holidays",
    description: "Ensures soldiers arrive home by 10:00 AM on weekends or holidays.",
    category: "Leave and Vacation",
  },

  // Travel and Emergency Support
  {
    id: 14,
    title: "Flight for Family Emergency",
    description: "Fully funded flight and stay for up to 30 days in case of first-degree family emergencies.",
    category: "Travel and Emergency Support",
  },
  {
    id: 15,
    title: "Flight Ticket Funding for Parents’ Visit",
    description: "Funding for up to two round trips during service for visiting parents abroad.",
    category: "Travel and Emergency Support",
  },

  // Post-Service Support
  {
    id: 16,
    title: "Rent Payment Support",
    description: "Financial support for rent payments up to 12 months after discharge.",
    category: "Post-Service Support",
  },
  {
    id: 17,
    title: "Assistance in Purchasing Furniture",
    description: "One-time allowance for house furniture expenses upon presenting receipts.",
    category: "Post-Service Support",
  },

  // Educational and Career Development
  {
    id: 18,
    title: "Pre-Academic Preparatory Programs",
    description: "Access to pre-academic courses to prepare for higher education.",
    category: "Educational and Career Development",
  },
  {
    id: 19,
    title: "Scholarships for Discharged Soldiers",
    description: "Scholarships such as the Uniform to Studies program for higher education.",
    category: "Educational and Career Development",
  },
  {
    id: 20,
    title: "Hi-Tech Professional Training",
    description: "Professional bootcamp programs for discharged combat soldiers to join the hi-tech industry.",
    category: "Educational and Career Development",
  },

  // Government and Municipal Benefits
  {
    id: 21,
    title: "Property Tax Exemption",
    description: "Exemption on property taxes up to four months after discharge.",
    category: "Government and Municipal Benefits",
  },
  {
    id: 22,
    title: "Income Tax Reductions",
    description: "Reduced income tax for three years after discharge.",
    category: "Government and Municipal Benefits",
  },
  {
    id: 23,
    title: "Passport and Travel Document Fees",
    description: "Exemption from fees for issuing or renewing passports during service.",
    category: "Government and Municipal Benefits",
  },

  // Healthcare and Counseling
  {
    id: 24,
    title: "Mental Health Support",
    description: "Access to mental health professionals during service.",
    category: "Healthcare and Counseling",
  },
  {
    id: 25,
    title: "Prosthetic Dental Care",
    description: "Coverage for up to two crown or implant treatments.",
    category: "Healthcare and Counseling",
  },
];
