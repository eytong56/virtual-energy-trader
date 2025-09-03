import {
  Card,
  Form,
  DatePicker,
  Button,
  InputNumber,
  Radio,
} from "@arco-design/web-react";
import { useState, useEffect } from "react";
const FormItem = Form.Item;

function BidForm() {
  const [bidDate, setBidDate] = useState("");
  const [bidHour, setBidHour] = useState("");
  const [bidType, setBidType] = useState("");
  const [bidPrice, setBidPrice] = useState(0);
  const [bidQuantity, setBidQuantity] = useState(0);

  const handleSubmit = async () => {
    try {
      if (
        bidDate === null ||
        bidHour === null ||
        bidType === null ||
        bidPrice === null ||
        bidQuantity === null
      ) {
        console.log("Empty input");
        return;
      }
      const body = {
        market_date: bidDate,
        hour_slot: bidHour,
        bid_type: bidType,
        price: bidPrice,
        quantity: bidQuantity,
      };
      console.log(body);
      const response = await fetch("http://localhost:3000/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response) {
        throw new Error("Failed to create new bid");
      }

      const newBid = await response.json();
      console.log(newBid);

      // Reset inputs
      setBidDate("");
      setBidHour("");
      setBidType("");
      setBidPrice(0);
      setBidQuantity(0);
      // onBidAdded(); // Refresh bids
    } catch (error) {
      console.log(`Error creating new bid: ${error}`);
      // setError(error);
    } finally {
      // setSubmitting(false);
    }
  };

  const handleDateChange = (dateString, date) => {
    setBidDate(dateString); // date is a Dayjs object
    console.log("Selected date:", dateString); // formatted string
    console.log("Date object:", date); // Dayjs object
  };

  return (
    <Card style={{ width: 480 }} title="Bid Submission Form" bordered={false}>
      <Form layout="horizontal" autoComplete="off" size="mini">
        <FormItem
          label="Bid Date"
          field="date"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <DatePicker
            style={{ width: 200 }}
            value={bidDate}
            onChange={handleDateChange}
          />
        </FormItem>
        <FormItem
          label="Hour Slot"
          field="hourSlot"
          rules={[
            {
              type: "number",
              required: true,
              validator: (value, callback) => {
                if (value < 0 || value > 23) {
                  callback("Hour must be between 0 - 23");
                }
              },
            },
          ]}
        >
          <InputNumber
            placeholder="Enter hour slot"
            value={bidHour}
            onChange={(value) => setBidHour(value)}
          />
        </FormItem>
        <FormItem
          label="Bid Type"
          field="bidType"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Radio.Group value={bidType} onChange={(value) => setBidType(value)}>
            <Radio value="buy">Buy</Radio>
            <Radio value="sell">Sell</Radio>
          </Radio.Group>
        </FormItem>
        <FormItem
          label="Price ($/MWh)"
          field="price"
          rules={[
            {
              type: "number",
              required: true,
              validator: (value, callback) => {
                if (value <= 0) {
                  callback("Price must be greater than $0!");
                }
              },
            },
          ]}
        >
          <InputNumber
            placeholder="Enter bid price"
            value={bidPrice}
            onChange={(value) => setBidPrice(value)}
          />
        </FormItem>
        <FormItem
          label="Quantity (MW)"
          field="quantity"
          rules={[
            {
              type: "number",
              required: true,
              validator: (value, callback) => {
                if (value <= 0) {
                  callback("Quantity must be greater than 0!");
                }
              },
            },
          ]}
        >
          <InputNumber
            placeholder="Enter quantity"
            value={bidQuantity}
            onChange={(value) => setBidQuantity(value)}
          />
        </FormItem>
        <FormItem wrapperCol={{ offset: 5 }}>
          <Button type="primary" onClick={handleSubmit}>
            Submit Bid
          </Button>
        </FormItem>
      </Form>
    </Card>
  );
}

export default BidForm;
