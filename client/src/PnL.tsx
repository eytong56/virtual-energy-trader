import { Card, Statistic } from "@arco-design/web-react";
import { IconArrowRise, IconArrowFall } from "@arco-design/web-react/icon";
import { useState, useEffect } from "react";

function PnL() {
  const [totalPnL, setTotalPnL] = useState(0);
  const [dailyPnL, setDailyPnL] = useState(0);

  useEffect(() => {
    const fetchPnL = async () => {
      try {
        let response = await fetch(
          "http://localhost:3000/api/settlements/pnl"
        );
        if (!response.ok) {
          throw new Error(`Failed to retrieve PnL! Status: ${response.status}`);
        }
        let data = await response.json();
        console.log(data);
        setTotalPnL(data.total_pnl);

        const today = new Date().toISOString().split("T")[0];
        response = await fetch(
          `http://localhost:3000/api/settlements/pnl?date=${today}`
        );
        if (!response.ok) {
          throw new Error(`Failed to retrieve PnL! Status: ${response.status}`);
        }
        data = await response.json();
        console.log(data);
        setDailyPnL(data.daily_pnl);
      } catch (error) {
        // setError(error.message);
      } finally {
        // setLoading(false);
      }
    };
    fetchPnL();
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
        value={dailyPnL}
        suffix={<IconArrowFall style={{ color: "#0fbf60" }} />}
        style={{ marginRight: 60, marginBottom: 20 }}
      />
    </Card>
  );
}

export default PnL;
