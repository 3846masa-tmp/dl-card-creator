'use strict';

const fs = require('fs-promise');
const spawn = require('child_process').spawn;
const co = require('co');

const baseSVG = fs.readFileSync('./serial.svg', 'utf8');
const serialCSV = fs.readFileSync('./serial.csv', 'utf8');
const serialList =
  serialCSV.split('\n')
    .filter((s) => !!s)
    .map((s) => s.split(',').map((i) => i.trim()));

function zeroPadding(num, len) {
  return ( '0'.repeat(len) + num.toString() ).substr(-1 * len);
}

co(function * () {
  for (let cnt = 1; cnt <= serialList.length; cnt++) {
    const serial = serialList[ cnt - 1 ];

    const svg = baseSVG
      .replace(/AABBCCDDEEFF/, serial[0])
      .replace(/No\.001/, `No.${ zeroPadding(serial[1], 3) }`);

    const basename = `serial_${ zeroPadding(cnt % 10, 2) }`;

    yield fs.writeFile(`./${ basename }.svg`, svg, 'utf8');

    const psMakePng = spawn('C:\\Program Files\\Inkscape\\inkscape.exe', [
      '-f', `./${ basename }.svg`,
      '-e', `./${ basename }.png`,
      '-d', '300'
    ]);
    yield new Promise((resolve) => psMakePng.on('close', resolve));

    if (cnt % 10 === 0) {
      const psMakePDF = spawn('C:\\Program Files\\Inkscape\\inkscape.exe', [
        '-f', './print.svg',
        '-A', `./print_${ zeroPadding(cnt / 10, 3) }.pdf`,
        '-d', '300'
      ]);
      yield new Promise((resolve) => psMakePDF.on('close', resolve));
    }
  }
})
.catch((err) => console.error(err.stack || err));
