import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {fileTypeFromBuffer} from 'file-type';
import decompressUnzip from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function isJpg(input) {
	const fileType = await fileTypeFromBuffer(input);
	return fileType?.mime === 'image/jpeg';
}

test('extract file', async t => {
	const buf = await fs.readFile(path.join(__dirname, 'fixtures', 'file.zip'));
	const files = await decompressUnzip()(buf);

	t.is(files[0].path, 'test.jpg');
	t.true(await isJpg(files[0].data));
});

test('extract multiple files', async t => {
	const buf = await fs.readFile(path.join(__dirname, 'fixtures', 'multiple.zip'));
	const files = await decompressUnzip()(buf);

	t.is(files.length, 4);
	t.is(files[0].path, '0.txt');
	t.is(files[0].type, 'file');
	t.is(files[0].data.toString(), '1');
	t.is(files[3].path, '3/4/');
	t.is(files[3].type, 'directory');
});

test('extract symlinks', async t => {
	const buf = await fs.readFile(path.join(__dirname, 'fixtures', 'symlink.zip'));
	const files = await decompressUnzip()(buf);

	t.is(files[0].path, 'ReactiveCocoa');
	t.is(files[0].type, 'symlink');
	t.is(files[0].linkname, 'Versions/Current/ReactiveCocoa');
});

test('return empty array if non-valid file is supplied', async t => {
	const buf = await fs.readFile(__filename);
	const files = await decompressUnzip()(buf);

	t.is(files.length, 0);
});

test('throw on wrong input', async t => {
	await t.throwsAsync(decompressUnzip()('foo'), undefined, 'Expected a Buffer, got string');
});

test('handle empty zip file', async t => {
	const buf = await fs.readFile(path.join(__dirname, 'fixtures', 'empty.zip'));
	const files = await decompressUnzip()(buf);

	t.is(files.length, 0);
});

test('handle directory with mode 0', async t => {
	const buf = await fs.readFile(path.join(__dirname, 'fixtures', 'dir-mode0.zip'));
	const files = await decompressUnzip()(buf);

	t.is(files.length, 1);
	t.is(files[0].type, 'directory');
	t.is(files[0].mode, 493); // Should be set to 493 (lines 36-37)
});

test('handle corrupted zip', async t => {
	// ZIP file with DEFLATE compression but invalid compressed data
	// This attempts to trigger error handling in extractEntry (lines 55-56)
	const buf = await fs.readFile(path.join(__dirname, 'fixtures', 'corrupted.zip'));

	// This should trigger error handling when yauzl tries to decompress
	await t.throwsAsync(decompressUnzip()(buf));
});
