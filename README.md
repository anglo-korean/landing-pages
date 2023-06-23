# Lander

Lander is a really dirt simple service which powers landing pages, accepting signup email addresses.

It comprises two tightly coupled projects

## lander-pages

Lander Pages, found in the `pages/` directory, is a preact app which serves up landing pages. Landing pages are configured in `pages/src/lib/config.js`.

## lander

Lander, found in the root directory, is a [digitalocean functions](https://www.digitalocean.com/products/functions) package which accepts signups from landing pages and stores them in a [digitalocean space](https://www.digitalocean.com/products/spaces), keyed against a downcased/ base64'd email address (to avoid double signups)
