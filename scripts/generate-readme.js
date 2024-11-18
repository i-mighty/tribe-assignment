const {writeFileSync} = require('fs');
const { generateReadme } = require('../readme.js');
console.log('====================================');
console.log('writing');
console.log('====================================');
writeFileSync('README.md', generateReadme(), 'utf8'); 