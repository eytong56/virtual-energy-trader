import { Card, Statistic } from "@arco-design/web-react";
import { IconArrowRise, IconArrowFall } from "@arco-design/web-react/icon";
import { useState, useEffect } from "react";

function PnL() {
  const [totalPnL, setTotalPnL] = useState(0);

  useEffect(() => {
    const fetchTotalPnL = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/settlements/pnl"
        );
        if (!response.ok) {
          throw new Error(`Failed to retrieve PnL! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        setTotalPnL(data.total_pnl);
      } catch (error) {
        // setError(error.message);
      } finally {
        // setLoading(false);
      }
    };
    fetchTotalPnL();
  }, []);
  return (
    <Card title="Profit & Loss" bordered={false}>
      <Statistic
        title="Cumulative PnL"
        value={totalPnL}
        suffix={<IconArrowRise style={{ color: "#ee4d38" }} />}
        style={{ marginRight: 60, marginBottom: 20 }}
      />
      <Statistic
        title="Today's PnL"
        value={totalPnL}
        suffix={<IconArrowFall style={{ color: "#0fbf60" }} />}
        style={{ marginRight: 60, marginBottom: 20 }}
      />
    </Card>
  );
}

export default PnL;
