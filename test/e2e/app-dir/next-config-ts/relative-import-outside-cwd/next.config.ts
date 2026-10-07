import type { NextConfig } from 'next'
import { configHelperValue } from './config-helpers'

const nextConfig: NextConfig = {
  env: {
    configHelperValue,
  },
}

export default nextConfig
