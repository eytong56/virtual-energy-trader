import { Card, Table } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function ContractList({settlements}) {

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

  if (settlements === null) {
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
