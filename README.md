# Anwesa Ray — portfolio site

Plain HTML, CSS and JavaScript. No build step and no frameworks, so it runs on free GitHub Pages.

```
index.html            the homepage
work/*.html           one page per case study (also loaded into the pop-up on the homepage)
css/style.css         all styles (desktop design is 1440 px wide; tablet and phone layouts at the bottom)
js/main.js            all interactions (about 8 KB)
images/               every image, as WebP (logo is PNG)
Anwesa-Ray-Resume.pdf linked from the footer
```

## Put it online (GitHub Pages, free)
1. Create a new public repository on GitHub, for example `anwesaray.github.io`.
2. Upload everything inside this folder (not the folder itself) with **Add file → Upload files**.
3. Go to **Settings → Pages**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<your-username>.github.io/` (or the repo name).

Opening `index.html` straight from your computer works too. The only difference is that the case studies open as their own pages instead of the pop-up, because browsers block that from local files.

## Swapping images
Replace a file in `images/` with one of the **same name** and it updates everywhere. A few came out of a small Figma screenshot and are low resolution, so swap them for originals when you can:
`painting-mouse.webp`, `painting-lotus.webp`, `painting-rose.webp`, `painting-underwater.webp`, `work-medhelper.webp`.
Thumbnails look best at 600×340 px, paintings at about 1000 px on the long side.

## Anchoring video
Save the clip as `images/anchoring.mp4`. Then, in `index.html`, find the comment inside `anchoring.mov` and replace the striped placeholder with the `<video>` line shown there. It only loads when someone opens the window.

## Editing case studies
Each `work/<project>.html` has the title, summary, role and sections in plain HTML. Replace the "Full case study coming soon" box with your write-up. The homepage pop-up shows whatever is inside `<article>`.

## Interactions
- **Hero:** windows drag by their title bar; click an icon to select it, double-click to open it (one tap on phones); paint on paint.exe (right-click or Alt-drag erases; the small square in its title bar clears it).
- **Scroll:** pixels tumble out of the monitor and the About windows drop in.
- **Work:** each row opens a Behance-style case-study pop-up with its own link (`#/work/<project>`), so the back button and sharing both work.
- **Paintings:** hovering a painting makes it grow; clicking opens it full size.
- **Motion:** everything respects "reduce motion" in the visitor's system settings.
