import Svg, {type PathProps, type SvgProps, Text} from 'react-native-svg'

import {APP_NAME} from '#/lib/brand'
import {useTheme} from '#/alf'

export function Logotype({
  fill,
  width = 32,
  ...rest
}: {fill?: PathProps['fill']} & SvgProps) {
  const t = useTheme()
  const size = Number.parseFloat(String(width))

  return (
    <Svg
      viewBox="0 0 80 20"
      role="img"
      aria-label={APP_NAME}
      {...rest}
      width={size}
      height={size / 4}>
      <Text
        x={0}
        y={15}
        fontFamily="InterVariable, sans-serif"
        fontWeight="700"
        fontSize={18}
        letterSpacing={-0.6}
        fill={fill || t.atoms.text.color}>
        {APP_NAME}
      </Text>
    </Svg>
  )
}
