import "./css/SavingsBenefits.css";
import LoggedInMenu from "./components/LoggedInMenu";

export default function SavingsBenefits() {
  const benefits = [
    {
      id: 1,
      name: "Retail Discounts",
      details: "Exclusive discounts at lidl supermarkets",
      eligible: true,
    },
    {
      id: 2,
      name: "Cashback on Purchases",
      details: "Enjoy Cashbacks on all purchases from zabka.",
      eligible: true,
    },
    {
      id: 3,
      name: "Free holiday",
      details: "Earn a free holiday to anywhere in europe.",
      eligible: false,
    },
    {
      id: 4,
      name: "Partner Store Discounts",
      details: "Exclusive discounts at partner stores and merchants.",
      eligible: true,
    },
  ];

  return (
    <div className="benefits-page">
      <LoggedInMenu />

      {/* Banner */}
      <div className="benefits-banner">
        <h2>Savings Account Benefits</h2>
        <p>
          As a Savings Account customer, you enjoy exclusive rewards designed
          to help you save more and earn more.
        </p>
      </div>

      {/* Benefits List */}
      <div className="benefits-list">
        {benefits.map((benefit) => (
          <div key={benefit.id} className="benefit-row">
            <div>
              <h4>{benefit.name}</h4>
              <p>{benefit.details}</p>
            </div>

            <span
              className={
                benefit.eligible ? "badge eligible" : "badge not-eligible"
              }
            >
              {benefit.eligible ? "Eligible" : "Not Eligible"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
