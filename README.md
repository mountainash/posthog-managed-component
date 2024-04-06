# PostHog Managed Component

> A managed component for PostHog analytics

Common use is currently for [Cloudflare Zaraz](https://www.cloudflare.com/application-services/products/zaraz/) (it's OSS so hopefully more use cases will come).

![PostHog](assets/icon.svg)

## TODO:

- [x] pull users PostHog API key from environment
- [x] send page views to PostHog
  - [ ] send URL
  - [ ] send referrer
  - [ ] send title
- [ ] send events to PostHog
- [ ] send user data to PostHog
- [ ] send custom data to PostHog
- [ ] add MC to <https://managedcomponents.dev/components/>
- [ ] add MC to <https://github.com/PostHog/integrations-repository/blob/main/integrations.json>
- [ ] mention MC on [PostHog Docs](https://posthog.com/docs/advanced/proxy/cloudflare)
- [ ] mention MC on [Discord](https://discord.com/channels/595317990191398933/917505178016579605/1225745641351675925)
- [ ] use bun bundler

## Documentation

[Managed Components docs](https://managedcomponents.dev/)

Find out more about Managed Components [here](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/) for inspiration and motivation details.

[![Released under the Apache license.](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Quickstart local dev environment

1. Make sure you're running [Bun](https://bun.sh/)
2. Install dependencies with `bun i`
3. Run unit test watcher with `bun run test:dev`

## ⚙️ Tool Settings

> Settings are used to configure the tool in a Component Manager config file

### Example Setting `boolean`

`exampleSetting` can be the pixelID or any other essential/optional setting like the option to anonymize IPs, send ecommerce events etc.

## 🧱 Fields Description

> Fields are properties that can/must be sent with certain events

### Human Readable Field Name `type` _required_

- **`POSTHOG_API_KEY`** personal PostHog API key
- **`POSTHOG_PROJECT_ID`** the ID of the project you want to send events to
- **`POSTHOG_URL`** (optional) the URL of your PostHog instance (default: `https://app.posthog.com`)

`field_id` give it a short description and send to a more detailed reference [Find more about how to create your own Managed Component](https://managedcomponents.dev/).

## Testing

Using [WebCM](https://webcm.dev/getting-started/install) you are able to run the Managed Component locally.

```bash
npx webcm components/posthog/index.js
```

**NOTE:** [WebCM](https://github.com/cloudflare/webcm) doesn't run on newer versions of NodeJS, so you may need to use `nvm` to switch to an older version or use the following Docker command

```bash
docker run -v $PWD:/home/node/app/ -w /home/node/app/ -p 1337:1337 -p 8000:8000 node:18 npx webcm components/posthog/index.js
```

OR

```bash
docker compose up
```

**NOTE:** If you are using Docker, you can access a running local site at <http://192.168.1.1:8080>, but you need to set `target:` to an address the container can connect to (`localhost` in the container, is not the same as `localhost` when called on your host) and `hostname: 'webcm'` in your [webcm.config.ts](./webcm.config.ts) file (see `./webcm.config.ts.docker-example`).

## Deployment

```bash
npx managed-component-to-cloudflare-worker ./index.js my-new-counter-mc
```

## 📝 License

Licensed under the [Apache License](./LICENSE).
