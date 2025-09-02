module.exports = {
  version: 2,
  discovery: {
    allowedHostnames: ['localhost'],
    networkIdleTimeout: 750,
    concurrency: 1,
  },
  snapshot: {
    widths: [1280, 375, 768],
    minHeight: 1024,
    percyCSS: `
      /* テスト環境でのみ実行されるため、不要な要素を隠す */
      .modalRoot {
        display: none !important;
      }
    `,
  },
  upload: {
    files: 'test-results/**/*.png',
  },
};
