import { Link } from "react-router-dom";
import "./css/LandingPage.css";
import heroImage from "./logo.png.jpg";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <div className="brand-box">
          <span className="brand-mark">A</span>
          <span className="brand-name">Apex Bank</span>
        </div>

        <nav className="top-nav">
          <a href="#open-account">How to create an account</a>
        </nav>

        <div className="top-actions">
          <Link to="/createAccount" className="top-create-btn">
            Create account
          </Link>
          <Link to="/login" className="top-login-btn">
            Log in
          </Link>
        </div>

      </header>

      <section className="hero-section">
        <div className="hero-panel">
          <p className="hero-kicker">Apex account</p>
          <h1>Open an account and gain more</h1>
          <p className="hero-subtitle">Get started in minutes and unlock exclusive welcome benefits.</p>

          <div className="promo-chip">Promotions</div>

          <div className="hero-offer">
            <div>
              <strong>£800</strong>
              <span>activity bonus</span>
            </div>
            <span className="offer-plus">+</span>
            <div>
              <strong>5%</strong>
              <span>on deposit for you</span>
            </div>
          </div>

          <Link to="/createAccount" className="hero-cta">
            Open an Apex Account
          </Link>
        </div>

        <div className="hero-image">
          <img src={heroImage} alt="Customer portrait" />
        </div>
      </section>


      <footer className="legal-footer">
        <h3>Legal notice</h3>

        <p>
          The organiser of this promotion is Apex Bank. You can join the &quot;up to £800 to
          start&quot; promotion until 31 March 2026. You will participate in the promotion if from 1
          February 2024 until you open an account with a debit card and Apex online services under
          this promotion, we have not maintained or are not maintaining any £ account for you
          (personal or joint) from our offer. You can join the &quot;Deposit for You on Your Good
          Morning&quot; promotion until 31 March 2026. You can join the &quot;Deposit for You on Your Good
          Morning with Select or Private Banking&quot; promotion until 31 March 2026. You can join the
          &quot;I recommend my bank - 12th edition&quot; programme until 28 February 2026. You can join the
          &quot;£250 for young people for saving&quot; promotion until 15 March 2026.
        </p>

        <p>
          The &quot;Golden Banker 2024&quot; ranking, organized by Bankier.pl and &quot;Puls Biznesu&quot; with the
          support of Minds&amp;Roses, was published. The &quot;Newsweek Friendly Bank&quot; ranking, prepared
          with Minds&amp;Roses and commissioned by Newsweek Polska, was awarded Institution of the Year
          2024 by MojeBankowanie.pl.
        </p>

        <p>
          BLIK payment - a BLIK transaction involving payment for goods or services at a
          brick-and-mortar store/service point or online. A BLIK ATM withdrawal is a cash withdrawal
          authorized with a BLIK code. Quasi-cash transactions do not count towards the card fee
          exemption.
        </p>

        <p>
          The mObywatel application is an application published by the Ministry of Digital Affairs.
        </p>

        <p>
          Details regarding the CyberRescue service are included in the Terms and Conditions for the
          CyberRescue &quot;Online Security Package&quot; service. The entity providing the CyberRescue
          service is CyberRescue Sp. z o. o. with its registered office in Warsaw, ul.
          Modlinska 129/U10, 03-186 Warsaw, entered into the National Court Register maintained by
          the District Court for the capital city of Warsaw in Warsaw, 13th Commercial Division of
          the National Court Register under KRS number 0000767083, Tax Identification Number (NIP)
          5242880817, and National Business Registry Number (REGON) 382315147. In order to use the
          service, it is necessary to accept and submit the Application available to individual
          customers of Apex Bank on Apex internet. To use Apex internet, you must have an Apex
          online service agreement with the bank.
        </p>

        <p>
          Explanations of terms and definitions regarding representative services related to payment
          accounts covered in this material can be found at apexbank.pl/PAD and at bank branches. An
          Apex account is a payment account, while Apex internet/mobile (online/mobile banking) is
          an electronic banking service. A My Goals account is a targeted savings account. A
          standard transfer is understood as a transfer submitted via Apex online services in the
          ELIXIR system. An instant transfer is an Express ELIXIR transfer order or a BlueCash
          transfer order. A BLIK payment is a BLIK transaction involving payment for goods or
          services at a brick-and-mortar store/service point or online store. A BLIK payment is a
          transfer order or internal transfer order. A BLIK mobile transfer is a transfer order or
          internal transfer order. A BLIK ATM withdrawal is a cash withdrawal authorized with a BLIK
          code. Quasi-cash transactions do not count towards the card fee exemption.
        </p>

        <p>
          A list of compatible devices and software required to use digital wallets can be found on
          apexbank.pl. Apple Pay is provided by Apple Inc. Google Pay is provided by Google Inc.
          Garmin Pay is provided by Garmin.
        </p>

        <p>
          This material is for marketing purposes only and does not constitute an offer within the
          meaning of Article 66 of the Civil Code. Details of the offer, including information on
          fees, commission, interest rates, and promotional terms and conditions, are available at
          apexbank.pl. Hotline 1 9999 - call charges apply according to the operator&apos;s tariff.
        </p>

        <p>
          Apex Bank with its registered office in Warsaw, at al. Jana Pawla II 17, 00-854 Warsaw,
          registered in the District Court for the capital city of Warsaw in Warsaw, 13th Commercial
          Division of the National Court Register under the KRS number 0000008723, established under
          the Regulation of the Council of Ministers of 11 April 1988 on the establishment of Bank
          Zachodni in Wroclaw (Journal of Laws of 1 July 1988) NIP 896-000-56-73, with the share
          capital and paid-up capital of £1 021 893 140.
        </p>
      </footer>
    </div>
  );
}
