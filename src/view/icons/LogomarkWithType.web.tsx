import Svg, {type PathProps, type SvgProps, Text} from 'react-native-svg'

import {APP_NAME} from '#/lib/brand'
import {Logomark} from '#/view/icons/Logomark'
import {useTheme} from '#/alf'

export function LogomarkWithType({
  fill,
  width = 32,
  ...rest
}: {fill?: PathProps['fill']} & SvgProps) {
  const t = useTheme()
  const size = Number.parseFloat(String(width))

  return (
    <Svg
      viewBox="0 0 136 31"
      role="img"
      aria-label={APP_NAME}
      {...rest}
      width={size}
      height={(size * 31) / 136}>
      <Logomark width={32} fill={fill} />
      <Text
        x={40}
        y={23}
        fontFamily="InterVariable, sans-serif"
        fontWeight="700"
        fontSize={23}
        letterSpacing={-0.7}
        fill={fill || t.atoms.text.color}>
        {APP_NAME}
      </Text>
    </Svg>
  )
}
