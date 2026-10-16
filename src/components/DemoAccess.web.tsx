import {useEffect, useState} from 'react'
import {View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'

import {reconnectDemoAccount} from '#/lib/demo-session'
import {useSession} from '#/state/session'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {Text} from '#/components/Typography'

/**
 * Local-only entry point for the seeded development account.
 * The gateway authenticates against the local PDS; no password is exposed.
 */
export function DemoAccess() {
  const {hasSession} = useSession()
  const t = useTheme()
  const {t: l} = useLingui()
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const enabled = __DEV__ && !!process.env.EXPO_PUBLIC_SERVICE_URL

  useEffect(() => {
    if (!enabled || hasSession) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    async function check() {
      try {
        const response = await fetch('/demo/status')
        const status = await response.json()
        if (!cancelled) {
          setReady(response.ok && status.ready === true)
          if (!status.ready) timer = setTimeout(check, 2000)
        }
      } catch {
        if (!cancelled) timer = setTimeout(check, 2000)
      }
    }
    void check()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [enabled, hasSession])

  if (!enabled || hasSession) return null

  async function signIn() {
    if (busy || !ready) return
    setBusy(true)
    setError(false)
    try {
      await reconnectDemoAccount()
    } catch {
      setError(true)
      setBusy(false)
    }
  }

  return (
    <View
      testID="demoAccess"
      style={[
        a.fixed,
        a.p_lg,
        a.gap_sm,
        a.rounded_lg,
        a.border,
        t.atoms.bg,
        t.atoms.border_contrast_medium,
        {top: 16, right: 16, width: 300, maxWidth: '90%', zIndex: 10000},
      ]}>
      <Text style={[a.text_sm, a.font_bold]}>
        <Trans>Local test environment</Trans>
      </Text>
      <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
        <Trans>
          Explore the app with a ready-to-use account and populated feed.
        </Trans>
      </Text>
      <Button
        testID="demoSignInButton"
        label={l`Sign in as test user`}
        color="primary"
        size="large"
        disabled={!ready || busy}
        onPress={signIn}>
        <ButtonText>
          {busy ? (
            <Trans>Signing in…</Trans>
          ) : ready ? (
            <Trans>Sign in as test user</Trans>
          ) : (
            <Trans>Preparing demo data…</Trans>
          )}
        </ButtonText>
      </Button>
      <Text style={[a.text_xs, t.atoms.text_contrast_medium]}>
        <Trans>Alex Morgan · @alex.test · No password needed</Trans>
      </Text>
      {error && (
        <Text accessibilityRole="alert" style={a.text_sm}>
          <Trans>Could not sign in to the local demo. Please try again.</Trans>
        </Text>
      )}
    </View>
  )
}
