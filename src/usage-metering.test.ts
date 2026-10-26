import assert from "node:assert/strict";
import { meterCustomerUsage } from "./usage-metering.ts";

const result = meterCustomerUsage({
  customerId: "subscriber-7",
  assetId: "download-9",
  event: "asset_delivery",
  units: 2,
});

assert.deepEqual(result, {
  customerId: "subscriber-7",
  metric: "asset_delivery",
  units: 2,
  resource: "download-9",
});
assert.throws(() => meterCustomerUsage({ customerId: "subscriber-7", assetId: "download-9", event: "asset_delivery", units: 0 }));
console.log("usage decision test passed");
