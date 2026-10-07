import type { NextConfig } from 'next'
// Local relative import from the TypeScript config
import { distDir } from './config-helpers'

const nextConfig: NextConfig = {
  distDir,
}

export default nextConfig
