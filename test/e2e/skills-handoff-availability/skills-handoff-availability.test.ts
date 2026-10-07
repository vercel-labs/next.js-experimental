/**
 * Regression test for the published skills in `skills/`.
 *
 * `npx skills add vercel/next.js --skill <name>` installs exactly the one
 * requested skill directory; it never resolves the sibling skills a skill
 * hands off to. This test simulates that single-skill install by copying only
 * `skills/next-bundle-optimizer` into an empty install root, then checks which
 * handoffs an agent could act on from the installed files alone.
 *
 * It documents the current (reported) behavior: `next-bundle-optimizer` names
 * three sibling skills and offers no install command or executable fallback
 * for any of them, while the adoption skills do ship such a command. When the
 * optimizer skills gain the same fallback, the expectations below must be
 * updated.
 */

import fs from 'fs-extra'
import path from 'path'
import os from 'os'

const SKILLS_DIR = path.join(__dirname, '..', '..', '..', 'skills')

/** Names of every skill published from the repository's `skills/` directory. */
function publishedSkillNames(): string[] {
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((name) => fs.existsSync(path.join(SKILLS_DIR, name, 'SKILL.md')))
    .sort()
}

/** Concatenated text of every file in an installed skill directory. */
function readSkillText(skillDir: string): string {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(entryPath)
      } else {
        files.push(entryPath)
      }
    }
  }
  walk(skillDir)
  return files
    .sort()
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n')
}

/** Sibling skills the text hands off to, e.g. "use `next-dev-loop`". */
function referencedHandoffs(text: string, self: string): string[] {
  return publishedSkillNames()
    .filter((name) => name !== self)
    .filter((name) => text.includes('`' + name + '`'))
}

/** Handoffs the text tells the agent how to install, e.g. `skills add`. */
function handoffsWithInstallCommand(text: string, self: string): string[] {
  return referencedHandoffs(text, self).filter((name) =>
    new RegExp(`skills add[^\\n]*${name}`).test(text)
  )
}

describe('published skills handoff availability', () => {
  let installRoot: string

  beforeAll(() => {
    // Mirrors what the installer writes for `--skill next-bundle-optimizer`:
    // a single directory under the project's skills root.
    installRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'next-skills-'))
    fs.copySync(
      path.join(SKILLS_DIR, 'next-bundle-optimizer'),
      path.join(installRoot, 'next-bundle-optimizer')
    )
  })

  afterAll(() => {
    fs.removeSync(installRoot)
  })

  it('installs only the requested skill', () => {
    expect(fs.readdirSync(installRoot).sort()).toEqual([
      'next-bundle-optimizer',
    ])
  })

  it('leaves every skill named by next-bundle-optimizer uninstalled', () => {
    const skillDir = path.join(installRoot, 'next-bundle-optimizer')
    const text = readSkillText(skillDir)

    const handoffs = referencedHandoffs(text, 'next-bundle-optimizer')
    expect(handoffs).toEqual([
      'next-cache-components-optimizer',
      'next-dev-loop',
      'next-partial-prefetching-optimizer',
    ])

    const installed = fs.readdirSync(installRoot)
    expect(handoffs.filter((name) => installed.includes(name))).toEqual([])
  })

  it('gives next-bundle-optimizer handoffs no install command or fallback', () => {
    const text = readSkillText(path.join(installRoot, 'next-bundle-optimizer'))

    // Current behavior: none of the three handoffs can be installed by
    // following the skill. A fix adds the missing `skills add` guidance (or
    // another executable fallback) and this expectation becomes all three.
    expect(handoffsWithInstallCommand(text, 'next-bundle-optimizer')).toEqual(
      []
    )
  })

  it('still documents the install command in the adoption skills', () => {
    // The supported pattern this skill is missing, kept as a contrast so the
    // assertion above cannot be satisfied by deleting the guidance elsewhere.
    const text = readSkillText(
      path.join(SKILLS_DIR, 'next-cache-components-adoption')
    )

    expect(
      handoffsWithInstallCommand(text, 'next-cache-components-adoption')
    ).toEqual(['next-dev-loop'])
  })
})
