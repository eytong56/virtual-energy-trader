import { Card, Statistic } from "@arco-design/web-react";
import { IconArrowRise, IconArrowFall } from '@arco-design/web-react/icon';

function PnL() {
  return (
    <Card title="Profit & Loss" bordered={false}>
      <Statistic
        title='Cumulative PnL'
        value={192393}
        suffix={<IconArrowRise style={{ color: '#ee4d38' }} />}
        style={{ marginRight: 60, marginBottom: 20 }}
      />
      <Statistic
        title="Today's PnL"
        value={934230}
        suffix={<IconArrowFall style={{ color: '#0fbf60' }} />}
        style={{ marginRight: 60, marginBottom: 20 }}
      />
    </Card>
  );
}

export default PnL;
