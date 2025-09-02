import { Card, List, Table } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function ContractList() {
  const [contracts, setContracts] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // Fetch contracts
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const columns: TableColumnProps[] = [
    {
      title: "Date",
      dataIndex: "market_date",
    },
    {
      title: "Hour",
      dataIndex: "hour_slot",
    },
    {
      title: "Clearing Price $/MWh",
      dataIndex: "clearing_price",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
  ];

  if (loading) {
    return (
      <Card title="Contracts" bordered={false}>
        "Loading..."
      </Card>
    );
  }

  const contractsFormatted = contracts.map((contract) => {
    return {
      key: contract.id,
      market_date: contract.market_date.split("T")[0],
      hour_slot: contract.hour_slot,
      clearing_price: contract.clearing_price,
      quantity: contract.quantity,
      status: contract.status,
    };
  });

  return (
    <Card title="Contracts" bordered={false}>
      <Table size="mini" columns={columns} data={contractsFormatted} />
    </Card>
  );
}

export default ContractList;
