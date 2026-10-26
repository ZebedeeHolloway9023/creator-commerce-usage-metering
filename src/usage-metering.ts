import { z } from "zod";

export const UsageRequest = z.object({
  customerId: z.string().min(1),
  assetId: z.string().min(1),
  event: z.enum(["asset_delivery", "subscriber_update", "content_processing"]),
  units: z.number().int().positive(),
});

export type UsageRequest = z.infer<typeof UsageRequest>;

export function meterCustomerUsage(input: unknown) {
  const request = UsageRequest.parse(input);
  return {
    customerId: request.customerId,
    metric: request.event,
    units: request.units,
    resource: request.assetId,
  };
}
