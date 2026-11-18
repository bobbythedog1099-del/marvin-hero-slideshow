MARVIN STUDIO — MOBILE HERO SLIDESHOW

FILES
- index.html             Slideshow markup
- styles.css              CSS-only crossfade animation
- assets/                 Optimized WebP images used by the page
- source-originals/       Original uploaded PNG images

HOW TO PREVIEW
1. Extract the folder.
2. Open index.html in Chrome or Safari.
3. For the intended mobile view, open Chrome DevTools and turn on the Device Toolbar,
   or open the page on a phone.

ANIMATION
- XL Strip appears first.
- Mini Tote fades in as XL Strip fades out.
- 4R fades in as Mini Tote fades out.
- The slideshow loops back to XL Strip.
- Each image stays on screen for 2 seconds, with a 2-second eased crossfade.
- Total loop: 12 seconds.

CUSTOMIZATION
- Change --slideshow-duration in styles.css to change the loop timing.
- Change object-position in .slide img if you want to shift the crop.
- Replace the WebP files in assets/ with new images using the same filenames.
- The slideshow uses CSS only; no JavaScript is required.
