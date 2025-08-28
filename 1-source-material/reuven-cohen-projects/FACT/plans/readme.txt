
#──────────────── requirements.txt ─────────
anthropic==0.19.1
arcade-sdk==0.4.7
aiohttp==3.9.5
python-dotenv==1.0.1
litellm
#──────────────── .env.example ─────────────
ANTHROPIC_API_KEY=sk-anthropic-XXXXXXXXXXXXXXXXXXXX
ARCADE_API_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXX
ARCADE_URL=http://localhost:9099

#──────────────── db/seed.sql ──────────────
CREATE TABLE revenue (
  quarter TEXT PRIMARY KEY,
  value   REAL
);
INSERT INTO revenue VALUES ('Q1-2025', 1234567.89);
INSERT INTO revenue VALUES ('Q4-2024', 1133221.55);

#──────────────── tools/__init__.py ────────
# empty package namespace

#──────────────── tools/sql_query.py ───────
"""Read‑only SQL query tool for FACT demo.
Register with: python tools/sql_query.py --register
"""
import os, sqlite3, argparse, json
from arcade import Tool, param, Client

DB_PATH = os.getenv("FACT_DB", "finance.db")
conn = sqlite3.connect(DB_PATH)

@Tool(
    name="SQL.QueryReadonly",
    desc="Run a SELECT statement on the finance DB",
    parameters={"statement": param.String()},
)
def sql_query(statement: str):
    if not statement.lower().strip().startswith("select"):
        raise ValueError("Only SELECT allowed")
    rows = conn.execute(statement).fetchall()
    cols = [c[0] for c in conn.execute(statement).description]
    return {"rows": [dict(zip(cols, r)) for r in rows]}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--register", action="store_true")
    args = parser.parse_args()
    if args.register:
        client = Client(os.environ["ARCADE_API_KEY"], base_url=os.getenv("ARCADE_URL"))
        client.tools.upload(sql_query)
        print("✅ SQL.QueryReadonly uploaded to Arcade")

#──────── gateway/docker-compose.yml ───────
version: "3.8"
services:
  arcade:
    image: ghcr.io/arcadeai/arcade-gateway:latest
    ports: ["9099:9099"]
    environment:
      - ARCADE_API_KEY=${ARCADE_API_KEY}
    volumes:
      - ../tools:/workspace/tools:ro

#──────────────── driver.py ────────────────
"""Async CLI for FACT stack"""
import asyncio, json, os, sys
from anthropic import AsyncAnthropic
from arcade import Client as Arcade
from dotenv import load_dotenv

load_dotenv()

anth = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
arc  = Arcade(os.getenv("ARCADE_API_KEY"), base_url=os.getenv("ARCADE_URL", "http://localhost:9099"))

MODEL      = "claude-3.5-sonnet-4"
CACHE_ID   = "fact_v1"
CACHE_PREF = (
    "You are a deterministic finance assistant. "
    "When uncertain, request data via tools."
)

tools_schema_cache = None

def tool_schema():
    global tools_schema_cache
    if tools_schema_cache is None:
        tools_schema_cache = [arc.tools.export_schema()]
    return tools_schema_cache

async def satisfy(tool_calls):
    msgs = []
    for call in tool_calls:
        res = arc.tools.execute(
            tool_name=call.name,
            user_id="fact_demo",
            arguments=json.loads(call.arguments),
        )
        msgs.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps(res),
        })
    return msgs

async def main():
    print("FACT demo. Ask a question. Ctrl+C to exit.")
    while True:
        try:
            user = input("\n> ")
        except (EOFError, KeyboardInterrupt):
            sys.exit(0)
        resp = await anth.messages.create(
            model=MODEL,
            system=CACHE_PREF,
            messages=[{"role": "user", "content": user}],
            tools=tool_schema(),
            cache_control={"mode": "read", "prefix": CACHE_ID},
        )
        if resp.tool_calls:
            tool_msgs = await satisfy(resp.tool_calls)
            resp = await anth.messages.create(
                model=MODEL,
                messages=tool_msgs,
                cache_control={"mode": "read", "prefix": CACHE_ID},
            )
        print("\n" + resp.content)

if __name__ == "__main__":
    asyncio.run(main())
