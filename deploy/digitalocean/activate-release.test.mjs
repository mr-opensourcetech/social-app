import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('activate-release.sh', import.meta.url))
const oldRevision = 'a'.repeat(40)
const newRevision = 'b'.repeat(40)

for (const scenario of [
  'success',
  'rollback',
  'first release failure',
  'rollback failure',
]) {
  test(`release activation: ${scenario}`, t => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'bluesky-release-'))
    t.after(() => rmSync(dir, {recursive: true, force: true}))
    const bin = path.join(dir, 'bin')
    mkdirSync(bin)
    for (const revision of [oldRevision, newRevision]) {
      const release = path.join(dir, 'releases', revision)
      mkdirSync(release, {recursive: true})
      writeFileSync(path.join(release, 'bskyweb'), '#!/bin/sh\nexit 0\n', {
        mode: 0o755,
      })
    }
    if (scenario !== 'first release failure') {
      symlinkSync(`releases/${oldRevision}`, path.join(dir, 'current'))
    }
    writeFileSync(
      path.join(bin, 'sudo'),
      '#!/bin/sh\necho restarted >> "$BLUESKY_DEPLOY_ROOT/restarts"\n',
      {mode: 0o755},
    )
    writeFileSync(path.join(bin, 'sleep'), '#!/bin/sh\nexit 0\n', {
      mode: 0o755,
    })
    writeFileSync(
      path.join(bin, 'curl'),
      `#!/bin/sh
if [ "$SCENARIO" = success ]; then exit 0; fi
if [ "$SCENARIO" = rollback ] && [ "$(readlink current)" = "releases/${oldRevision}" ]; then exit 0; fi
exit 1
`,
      {mode: 0o755},
    )
    const result = spawnSync('bash', [script, newRevision], {
      encoding: 'utf8',
      timeout: 10000,
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        BLUESKY_DEPLOY_ROOT: dir,
        SCENARIO: scenario,
      },
    })
    assert.equal(result.status, scenario === 'success' ? 0 : 1, result.stderr)
    if (scenario === 'first release failure') {
      assert.equal(existsSync(path.join(dir, 'current')), false)
    } else {
      assert.equal(
        readlinkSync(path.join(dir, 'current')),
        `releases/${scenario === 'success' ? newRevision : oldRevision}`,
      )
    }
    const restarts = readFileSync(path.join(dir, 'restarts'), 'utf8')
      .trim()
      .split('\n')
    assert.equal(restarts.length, scenario.startsWith('rollback') ? 2 : 1)
    if (scenario === 'rollback failure') {
      assert.match(result.stderr, /Rollback also failed/)
    }
  })
}

test('reject invalid revision before invoking deployment commands', () => {
  const result = spawnSync('bash', [script, '../bad-revision'], {
    encoding: 'utf8',
    timeout: 10000,
  })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Invalid revision/)
})
