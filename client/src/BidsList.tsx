import { Card, Table } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function ContractList() {
  const [bids, setBids] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // Fetch contracts
  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/bids");
        if (!response.ok) {
          throw new Error(
            `Failed to retrieve bids! Status: ${response.status}`
          );
        }
        const data = await response.json();
        console.log(data);
        setBids(data);
      } catch (error) {
        // setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
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
      title: "Price $/MWh",
      dataIndex: "price",
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
      <Card title="Bids" bordered={false}>
        "Loading..."
      </Card>
    );
  }

  const bidsFormatted = bids.map((bid) => {
    return {
      key: bid.id,
      market_date: bid.market_date.split("T")[0],
      hour_slot: bid.hour_slot,
      price: bid.price,
      quantity: bid.quantity,
      status: bid.status,
    };
  });

  return (
    <Card title="Bids" bordered={false}>
      <Table size="mini" columns={columns} data={bidsFormatted} />
    </Card>
  );
}

export default ContractList;
