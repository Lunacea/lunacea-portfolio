module.exports = {
  '*': ['eslint --fix --no-warn-ignored'],
  '**/*.ts?(x)': () => 'bun run check-types',
};
