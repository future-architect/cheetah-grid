const { execSync } = require('child_process')
execSync('npx -y link ../../packages/cheetah-grid', { stdio: 'inherit' })

require('./vetur')
require('./vue3-types')
