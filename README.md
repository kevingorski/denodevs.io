# Deno Devs Reverse Job Board

[Deno Devs](https://denodevs.io) is a reverse job board for developers looking
to work with Deno.

## Getting Started Locally

### Dependencies

You may install these manually or with
[tea developer environment setup](https://docs.tea.xyz/using-dev/dev) (not yet
working) if desired.

| Project                          | Version |
| -------------------------------- | ------- |
| deno.land                        | ^1.36.3 |
| github.com/evilmartians/lefthook | ^1.4.10 |

For manual setup:

- [Deno](https://deno.com/manual/getting_started/installation)
- [Git](https://github.com/git-guides/install-git)
- [A free Stripe account](https://stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli#install)

### Setup the repo

1. Clone the repo:

   ```bash
   git clone https://github.com/kevingorski/denodevs.io.git
   cd denodevs
   ```

2. Create a `.env` file to store environmental variables:

   ```
   cp .example.env .env
   ```

### Auth (OAuth)

1. [Register a new GitHub OAuth application](https://github.com/settings/applications/new)
   with the following values:

   - `Application name` = a name of your own choosing
   - `Homepage URL` = `http://localhost:8000`
   - `Authorization callback URL` = `http://localhost:8000/callback`

2. Once registered, copy the `Client ID` value to the `GITHUB_CLIENT_ID` value
   in your `.env` file.
3. Click `Generate a new client secret` and copy the resulting client secret to
   the `GITHUB_CLIENT_SECRET` environment variable in your `.env` file.

### Email

By default emails will be sent to the console rather than sent via
[Resend](https://resend.com/). If you have a Resend API key, that can be set at
`RESEND_API_KEY`, but you'll still need to turn off `SEND_EMAIL_TO_CONSOLE`
(`=false`).

You can also test changes to emails via the Admin area (explained in the next
section).

### Admin Access

In order to access the Admin area, you'll need to either use the default
passwords or update them.

**Caution**: By default local development traffic is not secured and these
values are sent via basic auth, so do not use anything you wouldn't want public
(because it essentially is).

```env
ADMIN_PASSWORD=xxx
ADMIN_USERNAME=xxx
```

### Securing Local Traffic (optional)

If you do set up a local SSL certficate, the following environment values will
need to be updated:

```env
SITE_BASE_URL=https://localhost:8000
USE_SECURE_COOKIES=true
```

### Payments and Subscriptions using Stripe (optional)

> Note: Stripe is only enabled if the `STRIPE_SECRET_KEY` environment variable
> is set.

1. Copy your Stripe secret key as `STRIPE_SECRET_KEY` into your `.env` file. We
   recommend using the test key for your development environment.
2. Run `deno task init:stripe` and follow the instructions. This automatically
   creates your "Premium tier" product and configures the Stripe customer
   portal.
   > Note: go to [tools/init_stripe.ts](tools/init_stripe.ts) if you'd like to
   > learn more about how the `init:stripe` task works.
3. Listen locally to Stripe events:
   ```
   stripe listen --forward-to localhost:8000/api/stripe-webhooks --events=customer.subscription.created,customer.subscription.deleted
   ```
4. Copy the webhook signing secret to [.env](.env) as `STRIPE_WEBHOOK_SECRET`.

> Note: You can use
> [Stripe's test credit cards](https://stripe.com/docs/testing) to make test
> payments while in Stripe's test mode.

### Running the Server

Finally, start the server by running:

```
deno task start
```

Go to [http://localhost:8000](http://localhost:8000) to begin playing with your
new SaaS app.

### Bootstrapping your local Database (Optional)

TODO: This currently doesn't work

```
deno task db:seed
```

To see all the values in your local Deno KV database, run

```
deno task db:dump
```

And all kv pairs will be logged to stdout

To reset your Deno KV database, run

```
deno task db:reset
```

Since this operation is not recoverable, you will be prompted to confirm
deletion before proceeding.

## Contributing

To come...

Before submitting, run the following to check the formatting, linting, and types
and run tests in one hit:

```
deno task ok
```

## Goals and Philosophy

To come...
