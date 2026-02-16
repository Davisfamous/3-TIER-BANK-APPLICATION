import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import TransactionPage from "./Transactions";
import AccountDetails from "./AccountDetails";
import SavingsBenefits from "./SavingsBenefits";
import Accountpage from "./Accountpage";
import CreateAccount from "./CreateAccount";
import LoginPage from "./LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/transactions" element={<TransactionPage />} />
        <Route path="/AccountDetails" element={<AccountDetails />} />
        <Route path="/Savingsbenefits" element={<SavingsBenefits />} />
        <Route path="/Accountpage" element={<Accountpage/>} />
        <Route path="/createAccount" element={<CreateAccount />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
