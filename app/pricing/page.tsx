import PricingCard from '../components/PricingCard'; // Adjusted import path

const pricingPlans = [
  {
    planName: "Basic",
    price: "Free*",
    description: "Get a glimpse of Adamass AI\'s power. Your first report is on us, viewable online.",
    features: [
      "1 Full Company Report",
      "View Online (No Download/Export)",
      "All Standard Analysis Sections",
      "Ideal for Trial & Evaluation",
    ],
    ctaText: "Sign Up & View Report",
    ctaLink: "/signup?plan=basic", // Example link
    footnote: "*Subscription required to download or export.",
  },
  {
    planName: "Pro",
    price: "10.99",
    currency: "€",
    frequency: "/ month",
    description: "Perfect for consultants and analysts needing regular, detailed company insights.",
    features: [
      "10 Company Reports / Month",
      "Full PDF & Data Export",
      "Enhanced Data Sources",
      "Standard Email Support",
      "Access to Report History",
    ],
    ctaText: "Get Started with Pro",
    ctaLink: "/signup?plan=pro", // Example link
    isPopular: false,
    label: undefined,
  },
  {
    planName: "Expert",
    price: "20.99",
    currency: "€",
    frequency: "/ month",
    description: "Unlimited power for teams and heavy users requiring extensive analysis capabilities.",
    features: [
      "Unlimited Company Reports / Month",
      "Full PDF & Data Export",
      "Premium Data Sources & Insights",
      "Priority Email & Chat Support",
      "Early Access to New Features",
      "API Access (Coming Soon)", // Example of an extra feature
    ],
    ctaText: "Become an Expert",
    ctaLink: "/signup?plan=expert", // Example link
    isPopular: true,
    label: "Most Popular",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white pt-34 lg:pt-32 pb-2 lg:pb-24 justify-center flex items-center center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 xl:px-32">
        <header className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tight">
            Choose Your Plan
          </h1>
         
          <p className="my-7 max-w-4xl mx-auto tracking-tight text-gray-500 md:text-xl font-light font-sans mb-0">
          Simple, transparent pricing. Get started for free, then scale as you grow.
            </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-6">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              planName={plan.planName}
              price={plan.price}
              currency={plan.currency}
              frequency={plan.frequency}
              description={plan.description}
              features={plan.features}
              ctaText={plan.ctaText}
              ctaLink={plan.ctaLink}
              isPopular={plan.isPopular}
              label={plan.label}
              footnote={plan.footnote}
            />
          ))}
        </div>
      </div>
    </main>
  );
} 