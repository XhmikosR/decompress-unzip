import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import isJpg from 'is-jpg';
import test from 'ava';
import decompressUnzip from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('extract file', async t => {
	const buf = await fs.readFile(path.join(__dirname, 'fixtures', 'file.zip'));
	const files = await decompressUnzip()(buf);

	t.is(files[0].path, 'test.jpg');
	t.true(isJpg(files[0].data));
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
