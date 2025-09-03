import {
  Card,
  Form,
  DatePicker,
  Button,
  InputNumber,
  Radio,
} from "@arco-design/web-react";
import { useState } from "react";
const FormItem = Form.Item;

function BidForm({reload}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validate();
      console.log("Form values:", values);
      if (
        !values.date ||
        !values.hourSlot ||
        !values.bidType ||
        !values.price ||
        !values.quantity
      ) {
        console.log("Empty input");
        return;
      }
      const body = {
        market_date: values.date,
        hour_slot: values.hourSlot,
        bid_type: values.bidType,
        price: values.price,
        quantity: values.quantity,
      };
      console.log(body);
      const response = await fetch("http://localhost:3000/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error("Failed to create new bid");
      }

      const newBid = await response.json();
      console.log(newBid);

      // Reset inputs
      form.resetFields();
      reload(); // Refresh bids
    } catch (error) {
      console.log(`Error creating new bid: ${error}`);
      // setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: 480 }} title="Bid Submission Form" bordered={false}>
      <Form form={form} layout="horizontal" autoComplete="off" size="mini">
        <FormItem
          label="Bid Date"
          field="date"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <DatePicker style={{ width: 200 }} />
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
          <InputNumber placeholder="Enter hour slot" />
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
          <Radio.Group>
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
          <InputNumber placeholder="Enter bid price" />
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
          <InputNumber placeholder="Enter quantity" />
        </FormItem>
        <FormItem wrapperCol={{ offset: 5 }}>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            Submit Bid
          </Button>
        </FormItem>
      </Form>
    </Card>
  );
}

export default BidForm;
