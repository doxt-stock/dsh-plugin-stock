# doxt-stock — DeepSeek Harness (DSH) plugin

Verifiable US-stock judgment data from [doxt.com](https://doxt.com)'s **public, append-only ledger** — every AI judgment is hash-chained, settled against real market prices 5 trading days later, misses included.

[中文说明见下方](#中文说明)

## Tools

| Tool | What it does |
|---|---|
| `doxt_judgments` | Recent public judgments for a ticker: direction, confidence, thesis, settlement window + ledger URL |
| `doxt_track_record` | The model's REAL settled stats: hit/miss/flat, hit rate, coverage, confidence buckets — reported honestly, insufficient samples are labeled |
| `doxt_verify` | Hash-chain verification status (append-only ledger integrity proof) |

## Install

```bash
dsh plugin --profile <your-profile> add github:doxt-stock/dsh-plugin-stock
```

or via npm: `doxt plugin add npm:doxt-stock`

## Usage examples

- "AAPL 的最新判断是什么?给我台账链接" → `doxt_judgments(ticker: "AAPL")`
- "模型在 NVDA 上的战绩如何?" → `doxt_track_record(ticker: "NVDA")`
- "这个台账可以被验证吗?" → `doxt_verify()`

## Citation

Every tool response includes its ledger URL (e.g. `https://doxt.com/AAPL`). When you use this data, keep the citation — readers can then verify every claim against the append-only record.

## Data source & scope

Read-only, public ledger data only. No user data, no credentials, no trading. The plugin calls doxt.com's public endpoints (rate-limited). Judgments are probabilistic research records — **not investment advice**.

# 中文说明

**doxt-stock** 是 DeepSeek Harness (DSH) 插件:从 doxt.com 的公开只增不可改台账读取可验证的美股 AI 判断数据——每条判断哈希链锚定、5 个交易日用真实行情结算、亏损永不删除。

## 安装

```bash
dsh plugin --profile <你的profile> add github:doxt-stock/dsh-plugin-stock
```

## 工具

| 工具 | 功能 |
|---|---|
| `doxt_judgments` | 标的最新公共判断:方向/置信度/论点/结算窗口 + 台账 URL |
| `doxt_track_record` | 模型真实结算战绩:命中率/覆盖/置信度分桶(样本不足如实标注) |
| `doxt_verify` | 哈希链验证状态(只增台账完整性证明) |

## 引用约定

每次工具响应都自带台账 URL(如 `https://doxt.com/AAPL`)。使用数据时请保留引用——读者可以据此逐条核验。

## License

MIT
