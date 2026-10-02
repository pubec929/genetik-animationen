const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const output = path.join(root, 'dist');

async function build() {
  // Only generated output is cleaned; source files are never modified.
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  await Promise.all([
    fs.cp(path.join(source, 'js'), path.join(output, 'assets/js'), { recursive: true }),
    fs.cp(path.join(source, 'styles'), path.join(output, 'assets/styles'), { recursive: true }),
    fs.cp(path.join(source, 'assets/images'), path.join(output, 'assets/images'), { recursive: true }),
  ]);

  const pages = (await fs.readdir(path.join(source, 'pages'))).filter(file => file.endsWith('.html'));
  for (const file of pages) {
    let html = await fs.readFile(path.join(source, 'pages', file), 'utf8');
    const references = [...html.matchAll(/(?:src|href)="(assets\/[^"?]+)(?:\?[^" ]*)?"/g)];
    for (const match of references) {
      const asset = path.resolve(output, match[1]);
      if (!asset.startsWith(output + path.sep)) throw new Error(`Invalid asset path: ${match[1]}`);
      const contents = await fs.readFile(asset);
      const version = createHash('sha256').update(contents).digest('hex').slice(0, 12);
      html = html.replace(match[0], match[0].replace(/=".*"$/, `="${match[1]}?v=${version}"`));
    }
    await fs.writeFile(path.join(output, file), html);
  }
  console.log(`Built ${pages.length} pages into dist/`);
}

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
