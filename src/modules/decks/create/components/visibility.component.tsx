import { RadioGroup } from '~/components/radio-group'
import { useCreateNewDeckContext } from '~/contexts/create-new-deck'

export const Visibility = () => {
  const { setVisibility, visibility, visibilityOptions } =
    useCreateNewDeckContext()

  return (
    <RadioGroup
      label='Visibilidade'
      options={visibilityOptions}
      selected={visibility}
      onChange={setVisibility}
    />
  )
}
