import { Card, Table } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function ContractList() {
  const [settlements, setSettlements] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // Fetch contracts
  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchSettlements();
  }, []);

  const columns: TableColumnProps[] = [
    {
      title: "Settlement Time",
      dataIndex: "settlement_time",
    },
    {
      title: "Profit/Loss ($)",
      dataIndex: "pnl_amount",
    },
    {
      title: "Real-time price ($)",
      dataIndex: "rt_price",
    },
  ];

  if (loading) {
    return (
      <Card title="Contracts" bordered={false}>
        "Loading..."
      </Card>
    );
  }

  const settlementsFormatted = settlements.map((settlement) => {
    return {
      ...settlement,
      key: settlement.id,
    };
  });

  return (
    <Card title="Settlements" bordered={false}>
      <Table size="mini" columns={columns} data={settlementsFormatted} />
    </Card>
  );
}

export default ContractList;
