import next from 'eslint-config-next/core-web-vitals'

const config = [...next, { ignores: ['**/.next/**', '**/node_modules/**'] }]

export default config
