import { RouterComponent } from './RouterComponent'

export default {
  component: RouterComponent,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/' },
    },
  },
}

export const Default = {}
