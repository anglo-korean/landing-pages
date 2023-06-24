# Lander

Lander is a really dirt simple service which powers landing pages, accepting signup email addresses.

It comprises two tightly coupled projects

## lander-pages

Lander Pages, found in the `pages/` directory, is a preact app which serves up landing pages. Landing pages are configured in `pages/src/config/lander.json`.

## lander

Lander, found in the `./lander` directory, is a [digitalocean functions](https://www.digitalocean.com/products/functions) package which accepts signups from landing pages and stores them in a [digitalocean space](https://www.digitalocean.com/products/spaces), keyed against a downcased/ base64'd email address (to avoid double signups)

Lander exists in a directory of its own, with a frankly mental nesting strategy, because that's how the abysmal digitalocean CLI expects it. We must use that tooling because:

1. There are no digitalocean docs explaining how to upload to the DO API directly for serverless
2. We can't do manual deployments (which honestly would be fine- that's how hateful the official tooling is) because the fucking serverless thing
   1. Builds your function in digitalocean (you can't give it a binary)
   2. Isn't smart enough to create a dummy module and do a go get to pull in non-inbuilt packages

Originally, we had a top-level `main.go` in this repo holding the function which was manually deployed.

The rationale behind _that_ direction may be found in [DIGITALOCEAN_RANT.md](DIGITALOCEAN_RANT.md)
