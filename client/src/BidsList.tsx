import { Card, Table } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function ContractList({ bids }) {
  // const [error, setError] = useState(null);

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
      title: "Type",
      dataIndex: "type",
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

  if (bids === null) {
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
      type: bid.bid_type,
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
