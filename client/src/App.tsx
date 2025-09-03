import { PageHeader, Card, Descriptions } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import BidForm from "./BidForm.tsx";
import BidsList from "./BidsList.tsx";
import ContractsList from "./ContractsList.js";
import SettlementsList from "./SettlementsList.tsx";
import PnL from "./PnL.tsx";
import Time from "./Time.tsx";
import { useState, useEffect } from "react";

const data = [
  {
    label: "User ID",
    value: "fca2d1de-0e58-4a27-9161-252e9958f40e",
  },
  {
    label: "Source",
    value: "CAISO",
  },
  {
    label: "Location",
    value: "TH_NP15_GEN-APND",
  },
];

function App() {
  const [bids, setBids] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [settlements, setSettlements] = useState(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Fetch functions
  const fetchBids = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/bids");
      if (!response.ok) {
        throw new Error(`Failed to retrieve bids! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setBids(data);
    } catch (error) {
      // setError(error.message);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/contracts");
      if (!response.ok) {
        throw new Error(
          `Failed to retrieve contracts! Status: ${response.status}`
        );
      }
      const data = await response.json();
      console.log(data);
      setContracts(data);
    } catch (error) {
      // setError(error.message);
    }
  };

  const fetchSettlements = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/settlements");
      if (!response.ok) {
        throw new Error(
          `Failed to retrieve settlements! Status: ${response.status}`
        );
      }
      const data = await response.json();
      console.log(data);
      setSettlements(data);
    } catch (error) {
      // setError(error.message);
    }
  };

  // useEffect that runs on mount and when reloadTrigger changes
  useEffect(() => {
    fetchBids();
    fetchContracts();
    fetchSettlements();
    // Add more fetches here as needed
  }, [reloadTrigger]);

  const handleReload = () => {
    setReloadTrigger((prev) => prev + 1); // Increment to trigger reload
  };

  return (
    <>
      <div style={{ minHeight: "100vh", backgroundColor: "#f7f8fa" }}>
        <PageHeader
          title="Virtual Energy Trading App"
          subTitle="CVector Take-home Test"
        ></PageHeader>
        <div
          style={{
            padding: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: "20px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px 20px",
            }}
          >
            <Card
              style={{ width: 480 }}
              title="Trading Information"
              bordered={false}
            >
              <Descriptions colon=" :" layout="inline-horizontal" data={data} />
            </Card>
            <PnL />
            <Time reload={handleReload}/>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px 20px",
            }}
          >
            <BidForm reload={handleReload}/>
            <BidsList bids={bids} />
            <ContractsList contracts={contracts} />
            <SettlementsList settlements={settlements} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
