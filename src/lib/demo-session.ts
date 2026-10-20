import {clearPersistedQueryStorage} from '#/lib/persisted-query-storage'
import * as persisted from '#/state/persisted'
import {type SessionAccount} from '#/state/session'

/** Only the explicitly configured local web demo may use test-account login. */
export function isLocalDemoAccount(account?: SessionAccount) {
  if (
    !__DEV__ ||
    !process.env.EXPO_PUBLIC_SERVICE_URL ||
    typeof window === 'undefined'
  ) {
    return false
  }
  try {
    return (
      !account ||
      new URL(account.service).origin === window.location.origin
    )
  } catch {
    return false
  }
}

/**
 * Obtain a fresh local session and discard obsolete sessions from earlier seeds.
 * Accounts belonging to other servers and general browser preferences are kept.
 */
export async function reconnectDemoAccount(): Promise<void> {
  if (!isLocalDemoAccount()) throw new Error('Local demo is not enabled')

  const response = await fetch('/demo/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({handle: 'alex.test'}),
  })
  if (!response.ok) throw new Error('Local test sign-in failed')
  const account: SessionAccount = await response.json()
  if (
    account.handle !== 'alex.test' ||
    !account.accessJwt ||
    !account.refreshJwt ||
    !isLocalDemoAccount(account)
  ) {
    throw new Error('Unexpected local test account')
  }

  const previousAccounts = persisted.get('session').accounts
  const localDids = new Set([
    account.did,
    ...previousAccounts.filter(isLocalDemoAccount).map(a => a.did),
  ])
  await Promise.all(
    [...localDids].map(did => clearPersistedQueryStorage(did)),
  )
  await persisted.write('session', {
    accounts: [
      ...previousAccounts.filter(a => !isLocalDemoAccount(a)),
      account,
    ],
    currentAccount: {did: account.did},
  })
  await persisted.write('onboarding', {step: 'Home'})
  await persisted.write('trendingDisabled', true)
  await persisted.write('trendingVideoDisabled', true)
  window.location.assign('/')
}
