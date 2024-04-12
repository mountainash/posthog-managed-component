# PostHog Managed Component

> A managed component for PostHog analytics

Common use is currently for [Cloudflare Zaraz](https://www.cloudflare.com/application-services/products/zaraz/) (it's OSS so hopefully more operators will come).

![PostHog](assets/icon.svg)

## How to use

### Zaraz / Cloudflare Worker

Until this component is an "official" Managed Component we need to manually host the MC in a Cloudflare Worker. Fortunately this is easy with a pre-built script to package this "[posthog-managed-component](https://github.com/mountainash/posthog-managed-component)" and upload it as a Worker.

1. From [this projects GitHub root](https://github.com/mountainash/posthog-managed-component), expand the green **Code** button
2. Choose the **Codespaces** tab
3. Click **Create codespace on develop**
4. At the Terminal command line enter `curl -fsSL https://bun.sh/install | bash` and press enter to install Bun into the Codespace VM
5. Enter `source /home/codespace/.bashrc` and press enter to allow `bun` commands
6. Enter `bun install` to setup the dependencies
7. Enter `CLOUDFLARE_ACCOUNT_ID=<YOUR_ACCOUNT_ID_VALUE>
CLOUDFLARE_API_TOKEN=<YOUR_API_TOKEN_VALUE>
CLOUDFLARE_EMAIL=<YOUR_EMAIL> bun run release` to run the pre-made script to build the code and add it to a new Cloudflare Worker. Replace obvious placeholders with details from your Cloudflare account. [Help?](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/#supported-environment-variables)
8. Follow the prompts to setup the Worker. For the "Does your component use any of these methods" question you can answer `n` (no)
9. Once complete, you can stop your Github Codespace
10. Login to the Cloudflare dash, and go to the [Zaraz Dashboard](https://dash.cloudflare.com/?to=/:account/:zone/zaraz/tools-config/tools/catalog)
11. From the new tools screen, choose **Custom Managed Component**
12. In the modal proceed to the **Select Custom MC** screen and choose `custom-mc-zaraz-posthog` from the list (this is your Worker that was just uploaded/created)
13. On the **Grant permissions** screen all permissions can be unset except **Server network requests** - this is needed to send requests to PostHog. Enable **Access client key-value store** if you want analytics to collated to a user over multiple sessions, else every session (even by the same user) will be logged as a new unique user
14. On the **Last step** screen change the tool name to **PostHog Managed Component**
    - Click the first **Add Field** button in the **Settings** section
    - Add a new custom field named `POSTHOG_API_KEY`
    - Click **Confirm**
    - In the value field enter your **Project API Key** (_not your personal API key_). You can find this in your PostHog project settings
    - _(optional)_ add another custom settings field with a name of `POSTHOG_URL` if your PostHog instance is not in the US. If your PostHog Project Settings say **EU Cloud** set this to `https://eu.i.posthog.com` (no trailing-slash)
15. Click **Save** to enable your new Zaraz Posthog Managed Component

Pageview's will now be tracked for all "orange cloud" enabled domains on your account (unless you have a Rule overriding this). You can also use use the [`zaraz.track()`](https://developers.cloudflare.com/zaraz/web-api/track/) in your website/webapp code to trigger for custom events.

## TODO:

### Basics
- [x] pull users PostHog API key from environment
- [x] send page views to PostHog
  - [x] send URL
  - [x] send referrer
  - [x] send title
- [x] send events to PostHog
- [x] send user data to PostHog
- [x] send custom data to PostHog
- [ ] get Zaraz Settings variable values passing in to `settings` object [known issue?](https://discord.com/channels/595317990191398933/1225979924628766823/1226893601590481066)

### Extra Features
- [ ] Session Replay
- [ ] Feature Flags
- [ ] A/B Testing
- [ ] Surveys

### Discovery
- [x] [add MC to](https://github.com/managed-components/docs/pull/10) <https://managedcomponents.dev/components/>
- [ ] add MC to <https://github.com/PostHog/integrations-repository/blob/main/integrations.json>
- [ ] mention MC on [PostHog Docs](https://posthog.com/docs/advanced/proxy/cloudflare)
  - [ ] & [here](https://github.com/PostHog/integrations-repository/blob/main/integrations.json)
- [x] mention MC on [Discord](https://discord.com/channels/595317990191398933/917505178016579605/1227513906381983745)
- [x] use bun bundler [#1](https://github.com/mountainash/posthog-managed-component/issues/1)

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

## Component Development

[![Released under the Apache license](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/mountainash/posthog-managed-component/pulls)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

1. Make sure you're running [Bun](https://bun.sh/)
2. Install dependencies with `bun i`
3. Run unit test watcher with `bun run test:dev`

## Testing

Using [WebCM](https://webcm.dev/getting-started/install) you are able to run the Managed Component locally.

```bash
npx webcm dist/index.js
```

**NOTE:** [WebCM](https://github.com/cloudflare/webcm) doesn't run on newer versions of NodeJS, so you may need to use `nvm` to switch to an older version or use the following Docker command

```bash
docker run -v $PWD/docker/:/app/ -v $PWD/dist/:/app/components/posthog/ -w /app/ -p 8080:8080 -p 8787:8787 node:18 npx webcm ./components/posthog/index.js
```

OR

```bash
docker compose up
```

The proxied local site will be available at <http://localhost:8787/>

**NOTE:** If you are using Docker, you can access a running local site at <http://192.168.1.1:8080>, but you need to set `target:` to an address the container can connect to (`localhost` in the container, is not the same as `localhost` when called on your host) and `hostname: 'webcm'` in your [webcm.config.ts](./docker/webcm.config.ts) file (see `./docker/webcm.config.ts.docker-example` as a starting point and rename it to `webcm.config.ts`).

## Deployment

```bash
bun run release
OR
bunx managed-component-to-cloudflare-worker ./dist/index.js zaraz-posthog
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
