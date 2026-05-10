const fs = require('fs');
const path = require('path');

const Text = require('../../src/Text');
const TagsManager = require('../../src/TagsManager');
const StringWritableStream = require('../../src/StringWritableStream');
const { once } = require('../../src/once');

async function getTextEntityTags() {
	const stream = new StringWritableStream();
	const manager = new TagsManager(stream);
	const text = new Text(0, 10, 2, 0, 'Cloud:');
	text.layer = { name: '0' };

	await text.tags(manager);
	await manager.finaliseWriting();

	stream.end();
	await once(stream, 'finish');

	return stream.toString();
}

async function main() {
	const inputPath = path.join(__dirname, '..', 'data', 'octicons-cloud-download.dxf');
	const outputPath = __filename + '.dxf';
	const endOfLine = '\n';
	const textTags = await getTextEntityTags();

	let s = fs.readFileSync(inputPath, 'utf8');
	s = s.replace('ENTITIES' + endOfLine, 'ENTITIES' + endOfLine + textTags);

	fs.writeFileSync(outputPath, s);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});