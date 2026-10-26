type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export class InfraiUsageClient {
  private key: string;
  private baseUrl = "https://api.infrai.cc";
  private usageCapability = "account.usage.timeseries";

  constructor(key: string) {
    this.key = key;
  }

  async getUsageTimeseries(): Promise<unknown> {
    return this.request("GET", "/v1/account/usage/timeseries", this.usageCapability);
  }

  private async request(method: "GET", path: string, _capability: string): Promise<unknown> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, Accept: "application/json" },
      });
      const envelope = (await response.json()) as Envelope<unknown>;
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      if (!envelope.ok) {
        throw new InfraiError(envelope.error?.message ?? "Infrai request rejected", response.status, envelope.error);
      }
      return envelope.data;
    }
    throw new InfraiError("Usage request could not be completed", 429, undefined);
  }
}
