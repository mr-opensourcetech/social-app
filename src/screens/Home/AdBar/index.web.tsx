import './styles.css'

import {useState} from 'react'
import {Text} from 'react-native'
import Animated, {useAnimatedStyle} from 'react-native-reanimated'
import {useLingui} from '@lingui/react/macro'
import {useIsFocused} from '@react-navigation/native'

import {useShellLayout} from '#/state/shell/shell-layout'
import {atoms as a, useBreakpoints, useTheme} from '#/alf'

export function AdBar() {
  const {t: l} = useLingui()
  const theme = useTheme()
  const {gtMobile} = useBreakpoints()
  const {footerHeight} = useShellLayout()
  const focused = useIsFocused()
  const [paused, setPaused] = useState(false)
  const position = useAnimatedStyle(() => ({
    bottom: gtMobile ? 0 : footerHeight.get(),
  }))

  if (!focused) return null

  return (
    <Animated.View
      testID="homeAdBar"
      style={[
        a.fixed,
        {left: 0, right: 0, zIndex: 2},
        position,
        theme.atoms.bg,
        theme.atoms.border_contrast_low,
        {borderTopWidth: 1},
      ]}>
      <aside
        className="home-ad-bar"
        aria-label={l`Advertisement`}
        style={{color: theme.atoms.text.color}}>
        <span className="home-ad-label">
          <Text style={{color: theme.atoms.text.color, fontSize: 11}}>
            {l`Ad`}
          </Text>
        </span>
        <div className="home-ad-window" tabIndex={0}>
          <div className="home-ad-track" data-paused={paused}>
            {[false, true].map(duplicate => (
              <span
                key={String(duplicate)}
                className="home-ad-copy"
                aria-hidden={duplicate || undefined}>
                <Text style={{color: theme.atoms.text.color, fontSize: 13}}>
                  {l`Your next discovery starts here · Advertise on Oursky · Sample advertisement`}
                </Text>
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="home-ad-pause"
          aria-label={paused ? l`Resume advertisement` : l`Pause advertisement`}
          onClick={() => setPaused(value => !value)}>
          {paused ? l`Play` : l`Pause`}
        </button>
      </aside>
    </Animated.View>
  )
}
