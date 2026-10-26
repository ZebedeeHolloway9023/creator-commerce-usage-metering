import { meterCustomerUsage } from "./usage-metering.ts";
import { InfraiUsageClient } from "./infrai-usage-client.ts";

const request = {
  customerId: "creator-subscriber-17",
  assetId: "episode-42",
  event: "asset_delivery" as const,
  units: 1,
};

const measured = meterCustomerUsage(request);
console.log("Measured usage", measured);

const key = process.env.INFRAI_API_KEY;
if (key) {
  const infrai = new InfraiUsageClient(key);
  const timeseries = await infrai.getUsageTimeseries();
  console.log("Infrai usage timeseries", timeseries);
} else {
  console.log("Set INFRAI_API_KEY to query the account usage timeseries.");
}
