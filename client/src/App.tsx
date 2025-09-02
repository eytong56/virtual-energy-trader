import { PageHeader, Card, Descriptions } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import BidForm from "./BidForm.tsx";
import BidsList from "./BidsList.tsx";
import ContractsList from "./ContractsList.js";
import SettlementsList from "./SettlementsList.tsx";
import PnL from "./PnL.tsx";
import Time from "./Time.tsx";

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
            <Time />
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px 20px",
            }}
          >
            <BidForm />
            <BidsList />
            <ContractsList />
            <SettlementsList />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
