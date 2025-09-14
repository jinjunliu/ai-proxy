import { Hono } from "hono"
import { cors } from "hono/cors"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { logger } from "hono/logger"
import { proxy } from "hono/proxy"

const app = new Hono()

app.use(cors())

app.use(logger())

app.use(async (c, next) => {
  await next()
  c.res.headers.set("X-Accel-Buffering", "no")
})

app.get("/", (c) =>
  c.html(`
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Proxy</title>
        <style>
          body {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: #fff;
            font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 0.5em;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          p {
            font-size: 1.3rem;
            margin-bottom: 2em;
          }
          .card {
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            padding: 2em 3em;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            text-align: center;
          }
          a {
            color: #ffd86b;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.2s;
          }
          a:hover {
            color: #fff;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🤖 AI Proxy</h1>
          <p>Welcome to your gateway for AI APIs.<br>Fast, secure, and easy to use.</p>
          <a href="https://github.com/jinjunliu/ai-proxy" target="_blank">View on GitHub</a>
        </div>
      </body>
    </html>
  `)
)

const fetchWithTimeout = async (
  url: string,
  { timeout, ...options }: RequestInit & { timeout: number },
) => {
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const res = await proxy(url, {
      ...options,
      signal: controller.signal,
      // @ts-expect-error
      duplex: "half",
    })
    clearTimeout(timeoutId)
    return res
  } catch (error) {
    clearTimeout(timeoutId)
    if (controller.signal.aborted) {
      return new Response("Request timeout", {
        status: 504,
      })
    }

    throw error
  }
}

const proxies: { pathSegment: string; target: string; orHostname?: string }[] =
  [
    {
      pathSegment: "generativelanguage",
      orHostname: "gooai.chatkit.app",
      target: "https://generativelanguage.googleapis.com",
    },
    {
      pathSegment: "groq",
      target: "https://api.groq.com",
    },
    {
      pathSegment: "anthropic",
      target: "https://api.anthropic.com",
    },
    {
      pathSegment: "pplx",
      target: "https://api.perplexity.ai",
    },
    {
      pathSegment: "openai",
      target: "https://api.openai.com",
    },
    {
      pathSegment: "mistral",
      target: "https://api.mistral.ai",
    },
    {
      pathSegment: "openrouter/api",
      target: "https://openrouter.ai/api",
    },
    {
      pathSegment: "openrouter",
      target: "https://openrouter.ai/api",
    },
    {
      pathSegment: "xai",
      target: "https://api.x.ai",
    },
    {
      pathSegment: "cerebras",
      target: "https://api.cerebras.ai",
    },
    {
      pathSegment: "googleapis-cloudcode-pa",
      target: "https://cloudcode-pa.googleapis.com",
    },
    {
      pathSegment: "deepseek",
      target: "https://api.deepseek.com",
    },
    {
      pathSegment: "siliconflow",
      target: "https://api.siliconflow.cn",
    },
    {
      pathSegment: "azure",
      target: process.env.YOUR_AZURE_ENDPOINT,
    },
  ]

app.post(
  "/custom-model-proxy",
  zValidator(
    "query",
    z.object({
      url: z.string().url(),
    }),
  ),
  async (c) => {
    const { url } = c.req.valid("query")

    const res = await proxy(url, {
      method: c.req.method,
      body: c.req.raw.body,
      headers: c.req.raw.headers,
    })

    return new Response(res.body, {
      headers: res.headers,
      status: res.status,
    })
  },
)

app.use(async (c, next) => {
  const url = new URL(c.req.url)

  const proxy = proxies.find(
    (p) =>
      url.pathname.startsWith(`/${p.pathSegment}/`) ||
      (p.orHostname && url.hostname === p.orHostname),
  )

  if (proxy) {
    const headers = new Headers()
    headers.set("host", new URL(proxy.target).hostname)

    c.req.raw.headers.forEach((value, key) => {
      const k = key.toLowerCase()
      if (
        !k.startsWith("cf-") &&
        !k.startsWith("x-forwarded-") &&
        !k.startsWith("cdn-") &&
        k !== "x-real-ip" &&
        k !== "host"
      ) {
        headers.set(key, value)
      }
    })

    const targetUrl = `${proxy.target}${url.pathname.replace(
      `/${proxy.pathSegment}/`,
      "/",
    )}${url.search}`

    const res = await fetchWithTimeout(targetUrl, {
      method: c.req.method,
      headers,
      body: c.req.raw.body,
      timeout: 60000,
    })

    return new Response(res.body, {
      headers: res.headers,
      status: res.status,
    })
  }

  next()
})

export default app
