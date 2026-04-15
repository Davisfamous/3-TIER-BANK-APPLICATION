import { useEffect } from "react";
import { getAllAccounts } from "../api/accountApi";

function Accounts() {

  useEffect(() => {
    getAllAccounts()
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return <div>Check console for accounts</div>;
}

export default Accounts;
