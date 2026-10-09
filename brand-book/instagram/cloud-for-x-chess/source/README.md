# Cloud for X-Chess: sources

- `render3d.html`: three.js scenes (`?s=processor`, `?s=processor&v=detail`, `?s=chess`, `?s=servers`).
  Needs `three@0.160.0` beside it: copy `three.module.js` to `three/` and `examples/jsm` to `three/jsm/`,
  then serve the folder over HTTP and screenshot the page with a transparent background.
  Renders used: processor 1400×1100, detail 600×600, chess 900×760 (exposure `e=0.62`), servers 1000×714.
- `post.html`: the 1080×1350 post, composited from the renders above.
- `frame.html`: the Instagram screen (2000×1500) around `post.png`.
- `shot.js`: screenshots a page element with Playwright (`PW` = path to playwright-core).
