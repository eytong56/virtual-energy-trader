import { Card, Statistic } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function Time() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedTime(new Date());
    }, 5 * 6000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Card title="Time" bordered={false}>
      <Statistic
        title="Current Time (Local)"
        value={currentTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
        style={{ marginRight: 60, marginBottom: 20 }}
      />
      <Statistic
        title="Last Updated"
        value={lastUpdatedTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })}
        style={{ marginRight: 60, marginBottom: 20 }}
      />
    </Card>
  );
}

export default Time;
