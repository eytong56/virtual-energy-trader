import { Card, Statistic, Button } from "@arco-design/web-react";
import { useState, useEffect } from "react";

function Time() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  async function handleClick() {
    try {
      setLoading(true);
      let response = await fetch("http://localhost:3000/api/admin/run-price-clearing", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch clearing prices! Status: ${response.status}`);
      }
      response = await fetch("http://localhost:3000/api/admin/run-bid-processing", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Failed to process pending bids! Status: ${response.status}`);
      }
      response = await fetch("http://localhost:3000/api/admin/run-settlement", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Failed to settle active contracts! Status: ${response.status}`);
      }
    } catch (error) {
      // setError(error.message);
    } finally {
      setLastUpdatedTime(new Date());
      setLoading(false);
    }
  }

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
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Updating..." : "Update Now"}
      </Button>
    </Card>
  );
}

export default Time;
