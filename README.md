# AI Proxy

This is a simple proxy for AI services.

## Sponsorship

This project is sponsored by [ChatWise](https://chatwise.app), the fastest AI chatbot that works for any LLM.

## Usage

Replace your API domain with the domain of the proxy deployed on your server. For example:

- Gemini:
  - from `https://generativelanguage.googleapis.com/v1beta` 
  - to`https://your-proxy/generativelanguage/v1beta`
- OpenAI:
  - from `https://api.openai.com/v1`
  - to `https://your-proxy/openai/v1`
- Anthropic:
  - from `https://api.anthropic.com/v1`
  - to `https://your-proxy/anthropic/v1`
- Groq:
  - from `https://api.groq.com/openai/v1`
  - to `https://your-proxy/groq/openai/v1`
- Perplexity:
  - from `https://api.perplexity.ai`
  - to `https://your-proxy/pplx`
- Mistral:
  - from `https://api.mistral.ai`
  - to `https://your-proxy/mistral`
- OpenRouter:
  - from `https://openrouter.ai/api`
  - to `https://your-proxy/openrouter`
- xAI:
  - from `https://api.xai.ai`
  - to `https://your-proxy/xai`
- Cerebras:
  - from `https://api.cerebras.ai`
  - to `https://your-proxy/cerebras`
- DeepSeek:
  - from `https://api.deepseek.com`
  - to `https://your-proxy/deepseek`
- SiliconFlow:
  - from `https://api.siliconflow.cn`
  - to `https://your-proxy/siliconflow`
- Azure AI:
  - from `https://YOUR_RESOURCE_NAME.services.ai.azure.com`
  - to `https://your-proxy/azure`

## Hosted by ChatWise

Use the hosted API, for example OpenAI `https://ai-proxy.chatwise.app/openai/v1`

## Deployment

Deploy this as a Docker container, check out [Dockerfile](./Dockerfile).

### Docker Deployment

#### Using Pre-built Images

Images are published to Docker Hub for both `linux/amd64` and `linux/arm64`.

- `:latest` → published on versioned releases (e.g., tags like `v1.2.3`)
- `:main` → built from the `main` branch (edge builds)
- Semantic tags → `1.2.3`, `1.2`, `1`

```bash
# Pull a stable release
docker pull jinjunliu/ai-proxy:latest

# Or pull the bleeding-edge main build
docker pull jinjunliu/ai-proxy:main

# Run with Docker (example uses latest)
docker run -d -p 3000:3000 --name ai-proxy \
  -e YOUR_AZURE_ENDPOINT=https://your-resource-name.services.ai.azure.com \
  jinjunliu/ai-proxy:latest
```

#### Building Locally

If you prefer to build the image yourself:

```bash
# Clone the repository
git clone https://github.com/jinjunliu/ai-proxy.git
cd ai-proxy

# Build the Docker image
docker build -t ai-proxy .

# Run the container
docker run -d -p 3000:3000 --name ai-proxy \
  -e YOUR_AZURE_ENDPOINT=https://your-resource-name.services.ai.azure.com \
  ai-proxy
```

#### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  ai-proxy:
    image: jinjunliu/ai-proxy:latest # use :main for edge
    ports:
      - "3000:3000"
    environment:
      - YOUR_AZURE_ENDPOINT=https://your-resource-name.services.ai.azure.com
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

> Note: Images are built with SBOM and provenance metadata enabled for supply‑chain transparency.

#### Environment Variables

- `YOUR_AZURE_ENDPOINT`: Azure AI endpoint URL (required for Azure proxy support)
- `PORT`: Port number (default: 3000)

## License

MIT.
