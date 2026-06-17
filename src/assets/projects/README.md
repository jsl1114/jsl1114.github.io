# Project screenshots

Drop project screenshots here, then list their filenames in the matching
project's `screenshots` array in `src/constants/const.js`. Each project's card
shows them in an auto-advancing carousel (with arrows + dots).

Recommended: **16:9 aspect ratio, ~1600×900px**, compressed (webp or png).

Example (`src/constants/const.js`):

```js
{
  title: "Inky",
  // ...
  image: "inky.png",            // small logo shown in the card header
  screenshots: ["inky-1.png", "inky-2.png"], // carousel previews (this folder)
}
```

If a `screenshots` array is empty (or a file fails to load), the carousel shows
a calm accent-tinted placeholder instead of a broken image. The logo (`image`
field) always shows in the card header, separate from the carousel.
