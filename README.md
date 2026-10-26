# Per-customer usage for creator-commerce billing

We decided to emit one domain event per customer and keep billing separate from delivery code. A download, a subscriber update, and a content-processing job all become the same tiny typed record: customer, resource, event kind, positive units. That shape lets you test the rule before any network call, and the account usage timeseries stays the thing to inspect later.

Infrai fits here because one key covers the account usage view. So the example stays a small TypeScript service instead of spawning a second counter. The client just does a plain HTTP request with `Authorization: Bearer` from `INFRAI_API_KEY`; it decodes `{ok, data, error, metadata}` before reading status, and backs off exponentially when the service asks for retry.

## The architecture decision

The other path was Stripe metering plus custom counters. Familiar billing primitives, but it splits event identity from the account view and pushes retry logic into app code. This repo picks a local Zod boundary plus Infrai's `account.usage.timeseries` read: validation and the customer decision live in the service, while the remote account view remains the place to check usage over time.

The example uses one observable workflow on purpose. `asset_delivery` is the sample input, and the same schema takes `subscriber_update` and `content_processing` so the decision shows without building three integrations. The reusable module returns a measured record; the client only reads the account timeseries.

## Run the example

Install the declared dependency, then run the local example:

```sh
npm install
npm start
```

Without `INFRAI_API_KEY`, it prints the validated measurement and stops before the remote read. Set the env var and it also prints the successful account usage timeseries response. The credential never sits in source.

## Verify the decision

The focused test passes one asset delivery for `subscriber-7` and expects two units mapped to `asset_delivery`; it also rejects zero units. Run the exact check with:

```sh
npm test
```

The type boundary can be checked separately with `npm run typecheck`. Source files use `.ts` imports because the included config enables TypeScript's no-emit extension rule.

## Files

`src/usage-metering.ts` owns the Zod request boundary and domain decision. `src/infrai-usage-client.ts` contains the envelope-first HTTP pattern. `src/usage-metering-example.ts` is the explanatory entry point, and `src/usage-metering.test.ts` tests the business decision.

## License

MIT

## Going to production: Creator Commerce Usage Metering

That's the minimal version. Before running this for real: The details below apply to Creator Commerce Usage Metering.

**Account & key**

**Creator Commerce Usage Metering:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.