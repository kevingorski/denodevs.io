# Deno Devs Reverse Job Board

[Deno Devs](https://denodevs.io) is a reverse job board for developers looking
to work with Deno.

## Getting Started Locally

### Prerequisites

- [Deno](https://deno.com/manual/getting_started/installation)
- [Git](https://github.com/git-guides/install-git)
- [A free Stripe account](https://stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli#install)

### Setup the repo

1. Clone the repo:

   ```bash
   git clone https://github.com/kevingorski/denodevs.git
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

If the home page is feeling a little empty, run

```
deno task db:seed
```

On execution, this script will fetch 20 (customizable) of the top HN posts using
the [HackerNews API](https://github.com/HackerNews/API) to populate your home
page.

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

## Deploying to Production

This section assumes that a
[local development environment](#getting-started-locally) has been set up.

### Authentication (OAuth)

1. [Change your OAuth app settings](https://github.com/settings/developers) to
   the following:

- `Homepage URL` = `https://{{ YOUR DOMAIN }}`
- `Authorization callback URL` = `http://{{ YOUR DOMAIN }}/callback`

### Payments (Stripe)

In order to use Stripe in production, you'll have to
[activate your Stripe account](https://stripe.com/docs/account/activate).

Once your Stripe account is activated, simply grab the production version of the
Stripe Secret Key. That will be the value of `STRIPE_SECRET_KEY` in prod.

### Automate Stripe Subscription Updates via Webhooks

Keep your user's customer information up-to-date with billing changes by
[registering a webhook endpoint in Stripe](https://stripe.com/docs/development/dashboard/register-webhook).

- Endpoint URL: `https://{{ YOUR DOMAIN }}/api/stripe-webhooks`
- Listen to `Events on your account`
- Select `customer.subscription.created` and `customer.subscription.deleted`

### Stripe Production Environmental Variables

- `STRIPE_SECRET_KEY`: Dashboard Home (Right Side of Page) -> Secret Key (only
  revealed once)
- `STRIPE_WEBHOOK_SECRET`: Dashboard Home -> Developers (right side of page) ->
  Create webhook -> Click Add Endpoint
  - After Creation, redirected to new webhook page -> Signing Secret -> Reveal
- `STRIPE_PREMIUM_PLAN_PRICE_ID`: Dashboard -> Products -> Premium Tier ->
  Pricing/API ID

### Stripe Customer Portal Branding

[Set up your branding on Stripe](https://dashboard.stripe.com/settings/branding),
as the user will be taken to Stripe's checkout page when they upgrade to a
subscription.

### Automatic Deployment with Deno Deploy

These steps show you how to deploy your SaaS app close to your users at the edge
with [Deno Deploy](https://deno.com/deploy).

1. Clone this repository for your SaaSKit project.

2. Sign into [Deno Deploy](https://dash.deno.com) with your GitHub account.

3. Select your GitHub organization or user, repository, and branch

4. Select "Automatic" deployment mode and `main.ts` as the entry point

5. Click "Link", which will start the deployment.

6. Once the deployment is complete, click on "Settings" and add the production
   environmental variables, then hit "Save"

You should be able to visit your newly deployed SaaS.

### Deno Deploy via GitHub Action

You can also choose to deploy to
[Deno Deploy via a GitHub Action](https://github.com/denoland/deployctl/blob/main/action/README.md),
which offers more flexibility. For instance, with the GitHub Action, you could:

- Add a build step
- Run `deno lint` to lint your code
- Run `deno test` to run automated unit tests

1. Create
   [a new, empty project from the Deno Deploy dashboard](https://dash.deno.com/new).
   Set a name for your project.

2. Add the GitHub Action.

   [GitHub Actions](https://docs.github.com/en/actions) are configured using a
   `.yml` file placed in the `.github/workflows` folder of your repo. Here's an
   example `.yml` file to deploy to Deno Deploy. Be sure to update the
   `YOUR_DENO_DEPLOY_PROJECT_NAME` with one that you've set in Deno Deploy.

   ```yml
   # Github action to deploy this project to Deno Deploy
   name: Deploy
   on: [push]

   jobs:
     deploy:
       name: Deploy
       runs-on: ubuntu-latest
       permissions:
         id-token: write  # Needed for auth with Deno Deploy
         contents: read  # Needed to clone the repository

       steps:
         - name: Clone repository
           uses: actions/checkout@v3

         - name: Install Deno
           uses: denoland/setup-deno@main
           # If you need to install a specific Deno version
           # with:
           #   deno-version: 1.32.4

   ## You would put your building, linting, testing and other CI/CD steps here

   ## Finally, deploy
         - name: Upload to Deno Deploy
           uses: denoland/deployctl@v1
           with:
             project: YOUR_DENO_DEPLOY_PROJECT_NAME
             entrypoint: main.ts
             # root: dist
             import-map: import_map.json
             exclude: .git/** .gitignore .vscode/** .github/** README.md .env .example.env
   ```

3. Commit and push your code to GitHub. This should trigger the GitHub Action.
   When the action successfully completes, your app should be available on Deno
   Deploy.

## Contributing

To come...

Before submitting, run the following to check the formatting, linting, licenses,
and types and run tests in one hit:

```
deno task ok
```

## Goals and Philosophy

To come...
