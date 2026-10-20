import {useState} from 'react'
import {useLingui} from '@lingui/react/macro'

import {isLocalDemoAccount, reconnectDemoAccount} from '#/lib/demo-session'
import {useSession, useSessionApi} from '#/state/session'
import {Error} from '#/components/Error'
import {EmojiSad_Stroke2_Corner0_Rounded as EmojiSadIcon} from '#/components/icons/Emoji'
import {useOtherRequiredDataQuery} from '#/ageAssurance/data'
import {IS_WEB} from '#/env'

export function DataUnavailableScreen() {
  const {t: l} = useLingui()
  const {currentAccount} = useSession()
  const {logoutCurrentAccount} = useSessionApi()
  const {isFetching, refetch} = useOtherRequiredDataQuery()
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [reconnectFailed, setReconnectFailed] = useState(false)

  if (IS_WEB && currentAccount && isLocalDemoAccount(currentAccount)) {
    return (
      <Error
        icon={EmojiSadIcon}
        title={l`Reconnect your test account`}
        message={
          reconnectFailed
            ? l`The local demo could not reconnect. Please try again in a moment.`
            : l`Your saved test session may be out of date. Reconnect to load the current demo data.`
        }
        isRetrying={isReconnecting}
        secondaryAction={{
          label: isReconnecting ? l`Reconnecting…` : l`Reconnect test user`,
          onPress: async () => {
            setIsReconnecting(true)
            setReconnectFailed(false)
            try {
              await reconnectDemoAccount()
            } catch {
              setReconnectFailed(true)
              setIsReconnecting(false)
            }
          },
        }}
      />
    )
  }

  return (
    <Error
      icon={EmojiSadIcon}
      title={l`Unable to load your account`}
      message={l`We couldn't load your account settings. Check your internet connection and try again.`}
      onRetry={() => void refetch()}
      isRetrying={isFetching}
      secondaryAction={{
        label: l`Sign out`,
        onPress: () => {
          if (IS_WEB) history.pushState(null, '', '/')
          logoutCurrentAccount('AgeAssuranceDataUnavailableScreen')
        },
      }}
    />
  )
}
