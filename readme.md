# decompress-unzip [![CI](https://github.com/kevva/decompress-unzip/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/kevva/decompress-unzip/actions/workflows/ci.yml)

> zip decompress plugin


## Install

```sh
npm install decompress-unzip
```


## Usage

```js
import decompress from 'decompress';
import decompressUnzip from 'decompress-unzip';

decompress('unicorn.zip', 'dist', {
	plugins: [
		decompressUnzip()
	]
}).then(() => {
	console.log('Files decompressed');
});
```


## API

### decompressUnzip()(buf)

#### buf

Type: `Buffer`

Buffer to decompress.


## License

MIT © [Kevin Mårtensson](https://github.com/kevva)
