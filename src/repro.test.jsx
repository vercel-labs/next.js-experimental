import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { composeStories, setProjectAnnotations } from '@storybook/nextjs-vite'
import * as previewAnnotations from '@storybook/nextjs-vite/preview'
import * as stories from './RouterComponent.stories'

setProjectAnnotations([previewAnnotations])

const { Default } = composeStories(stories)

describe('app router story', () => {
  it('renders a component calling useRouter()', async () => {
    await Default.load()
    render(<Default />)
  })
})
