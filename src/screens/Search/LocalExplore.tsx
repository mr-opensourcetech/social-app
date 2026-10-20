import {View} from 'react-native'
import {Trans, useLingui} from '@lingui/react/macro'
import {useNavigation} from '@react-navigation/native'
import {useQuery} from '@tanstack/react-query'

import {type NavigationProp} from '#/lib/routes/types'
import {useModerationOpts} from '#/state/preferences/moderation-opts'
import {useAppviewClient, useSession} from '#/state/session'
import {List} from '#/view/com/util/List'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {Loader} from '#/components/Loader'
import {Text} from '#/components/Typography'
import {app} from '#/lexicons'
import {SuggestedProfileCard} from './modules/ExploreSuggestedAccounts'

/**
 * Browse actual local profiles without the hosted recommendation services.
 * Searching still uses the app's normal people and post search endpoints.
 */
export function LocalExplore() {
  const t = useTheme()
  const {t: l} = useLingui()
  const navigation = useNavigation<NavigationProp>()
  const client = useAppviewClient()
  const {currentAccount} = useSession()
  const moderationOpts = useModerationOpts()
  const {data, isLoading, isFetching, error, refetch} = useQuery({
    queryKey: ['local-explore-people', currentAccount?.did],
    queryFn: () =>
      client.call(app.bsky.actor.searchActors, {q: '', limit: 100}),
    staleTime: 30_000,
  })
  const profiles = (data?.actors ?? [])
    .filter(
      profile =>
        profile.did !== currentAccount?.did &&
        profile.handle.endsWith('.test') &&
        !!profile.avatar &&
        !!profile.displayName,
    )
    .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''))

  const topics = [
    {label: l`Science`, query: 'electricity'},
    {label: l`Rights`, query: 'rights'},
    {label: l`Politics`, query: 'parliament'},
    {label: l`Sports`, query: 'championship'},
  ]

  return (
    <List
      testID="localExplore"
      desktopFixedHeight
      data={moderationOpts ? profiles : []}
      keyExtractor={(profile: (typeof profiles)[number]) => profile.did}
      contentContainerStyle={{paddingBottom: 100}}
      keyboardShouldPersistTaps="handled"
      refreshing={isFetching && !isLoading}
      onRefresh={() => void refetch()}
      ListHeaderComponent={
        <View style={[a.p_lg, a.gap_lg]}>
          <Text style={[a.text_xl, a.font_bold]}>
            <Trans>Explore</Trans>
          </Text>
          <View style={[a.flex_row, a.flex_wrap, a.gap_sm]}>
            {topics.map(topic => (
              <Button
                key={topic.query}
                label={topic.label}
                color="secondary"
                size="small"
                onPress={() =>
                  navigation.navigate('Search', {
                    q: topic.query,
                    tab: 'latest',
                  })
                }>
                <ButtonText>{topic.label}</ButtonText>
              </Button>
            ))}
          </View>
          <Text style={[a.text_lg, a.font_bold]}>
            <Trans>People</Trans>
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={[a.p_lg, a.gap_md]}>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <>
              <Text style={t.atoms.text_contrast_medium}>
                <Trans>Could not load accounts.</Trans>
              </Text>
              <Button
                label={l`Retry`}
                color="secondary"
                size="small"
                onPress={() => void refetch()}>
                <ButtonText>
                  <Trans>Retry</Trans>
                </ButtonText>
              </Button>
            </>
          ) : (
            <Text style={t.atoms.text_contrast_medium}>
              <Trans>No other accounts yet.</Trans>
            </Text>
          )}
        </View>
      }
      renderItem={({item, index}) =>
        moderationOpts ? (
          <SuggestedProfileCard
            profile={item}
            moderationOpts={moderationOpts}
            position={index}
          />
        ) : null
      }
    />
  )
}
