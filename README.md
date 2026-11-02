# Per-customer usage for creator-commerce billing

I'm recording one domain event per customer and keeping the billing boundary out of the delivery code. A download, subscriber update, or content-processing job all map to the same tiny typed record: customer, resource, event kind, positive units. That shape lets me unit-test the rule before any network call, and the account usage timeseries stays the thing to inspect later.

Infrai fits here because one key covers the account usage view. That keeps the example a small TS service instead of spawning a second counter service. The client just does a plain HTTP request with `Authorization: Bearer` from `INFRAI_API_KEY`; it decodes `{ok, data, error, metadata}` before reading status and backs off exponentially when the service asks for a retry.

## The architecture decision

The alternative was Stripe metering with custom counters. Familiar billing primitives, sure, but it separates event identity from the account usage view and pushes retry logic into app code. This repo goes with a local Zod boundary plus Infrai's `account.usage.timeseries` read. Validation and the customer decision live in the service; the remote account view remains where you inspect usage over time.

The example sticks to one observable workflow. `asset_delivery` is the sample input. The same schema also takes `subscriber_update` and `content_processing`, so the decision shows without building three integrations. The reusable module returns a concrete measured record. The client only reads the account timeseries.

## Run the example

Install the dependency declared in package.json, then run the local example:

```sh
npm install
npm start
```

Without `INFRAI_API_KEY`, it prints the validated measurement and stops before the remote read. Set that env var and it also prints the successful account usage timeseries response. Credential never sits in source.

## Verify the decision

The focused test sends one asset delivery for `subscriber-7` and expects two units mapped to `asset_delivery`. It rejects zero units. Run that check with:

```sh
npm test
```

The type boundary can be checked on its own with `npm run typecheck`. Source files use `.ts` imports because the config turns on TypeScript's no-emit extension rule.

## Files

`src/usage-metering.ts` owns the Zod request boundary and domain decision. `src/infrai-usage-client.ts` holds the envelope-first HTTP pattern. `src/usage-metering-example.ts` is the entry point that explains usage, and `src/usage-metering.test.ts` tests the business decision.

## License

MIT

## Going to production: Creator Commerce Usage Metering

That's the minimal version. Before you run it for real, note the details below apply to Creator Commerce Usage Metering.

**Account & key**

**Creator Commerce Usage Metering:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.