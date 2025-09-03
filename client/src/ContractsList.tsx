import { Card, List, Table } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function ContractList({contracts}) {

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

  if (contracts === null) {
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
      type: contract.position_type,
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
