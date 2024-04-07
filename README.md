# PostHog Managed Component

> A managed component for PostHog analytics

Common use is currently for [Cloudflare Zaraz](https://www.cloudflare.com/application-services/products/zaraz/) (it's OSS so hopefully more use-cases will come).

![PostHog](assets/icon.svg)

## TODO:

- [x] pull users PostHog API key from environment
- [x] send page views to PostHog
  - [x] send URL
  - [x] send referrer
  - [x] send title
- [x] send events to PostHog
- [x] send user data to PostHog
- [x] send custom data to PostHog
- [ ] add MC to <https://managedcomponents.dev/components/>
- [ ] add MC to <https://github.com/PostHog/integrations-repository/blob/main/integrations.json>
- [ ] mention MC on [PostHog Docs](https://posthog.com/docs/advanced/proxy/cloudflare)
- [ ] mention MC on [Discord](https://discord.com/channels/595317990191398933/917505178016579605/1225745641351675925)
- [x] use bun bundler [#1](https://github.com/mountainash/posthog-managed-component/issues/1)

## Documentation

[Managed Components docs](https://managedcomponents.dev/)

Find out more about Managed Components [here](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/) for inspiration and motivation details.

[![Released under the Apache license](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/mountainash/posthog-managed-component/pulls)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## 🚀 Quickstart local DEV environment

1. Make sure you're running [Bun](https://bun.sh/)
2. Install dependencies with `bun i`
3. Run unit test watcher with `bun run test:dev`

## ⚙️ Tool Settings

> Settings are used to configure the tool in a [Component Manager config file](./webcm.config.ts.docker-example)

### PostHog API Key `string`

The PostHog project API Key is the unique write-only key of your PostHog project. [How to find your Project API Key](https://app.posthog.com/project/settings)

### PostHog Project ID `string`

The PostHog Project ID is the unique reference of your PostHog project. [How to find your Project ID](https://app.posthog.com/project/settings)

### PostHog URL `string`

The PostHog API URL could be "eu.i.posthog.com" for the EU region or your self-hosted URL. Defaults to `https://us.i.posthog.com`

## 🧱 Fields Description

> Fields are properties that can/must be sent with certain events

### Track event name `string`

`event` is the event name that will be sent with a Track event. [Learn more](https://posthog.com/tutorials/api-capture-events)

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
bunx managed-component-to-cloudflare-worker ./components/posthog/index.js zaraz-posthog
```

Then you can configure it as tool using the Cloudflare Zaraz Dashboard at <https://dash.cloudflare.com/?to=/:account/:zone/zaraz/tools-config/tools/catalog>, look for "Custom Managed Component" and select the `custom-mc-zaraz-posthog` tool. Set the Tool Name to "PostHog" & enable "E-commerce tracking"

## Resources

- [Managed Components docs](https://managedcomponents.dev/)
- [Cloudflare Zaraz](https://www.cloudflare.com/application-services/products/zaraz/)
- [WebCM](https://webcm.dev/getting-started/install)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Blog: Open source Managed Components for Cloudflare Zaraz](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/)
- Support:
  - [Cloudflare Workers Discord](https://discord.gg/cloudflaredev)
  - <zaraz@cloudflare.com>

## 📝 License

Licensed under the [Apache License](./LICENSE).
