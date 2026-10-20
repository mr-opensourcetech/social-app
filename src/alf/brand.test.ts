import {themes} from '#/alf/themes'
import {brand, gradients} from '#/alf/tokens'
import {contrastRatio} from '#/alf/util/colorGeneration'

describe('Oursky brand', () => {
  it('uses the requested cream-to-peach stops for both brand gradients', () => {
    const stops = [
      [0, '#FAF6F1'],
      [1, '#FFB199'],
    ]
    expect(gradients.primary.values).toEqual(stops)
    expect(gradients.sky.values).toEqual(stops)
  })

  it.each([brand.gradientStart, brand.gradientEnd])(
    'keeps button labels readable against %s',
    background => {
      expect(
        contrastRatio(brand.onGradient, background),
      ).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each([themes.light, themes.dark, themes.dim])(
    'keeps links readable in the $name theme',
    theme => {
      expect(
        contrastRatio(
          theme.atoms.text_link.color,
          theme.atoms.bg.backgroundColor,
        ),
      ).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each([themes.light, themes.dark, themes.dim])(
    'keeps disabled primary labels readable in the $name theme',
    theme => {
      expect(
        contrastRatio(theme.palette.primary_700, theme.palette.primary_200),
      ).toBeGreaterThanOrEqual(4.5)
    },
  )
})
