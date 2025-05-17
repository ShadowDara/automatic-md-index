// script to test the module

import fs from 'fs';
import readline from 'readline';

/*
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
*/

import * as indexModule from './index.js';


const file_path = './Test.md';


function main() {
    console.log('Testing index.js module...');

    const content = fs.readFileSync(file_path, 'utf-8');
    return indexModule.lookup_index(content)

    //rl.question('Testing Module', (answer) => {})
}

main();
