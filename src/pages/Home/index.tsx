import { HandPalm, Play } from 'phosphor-react'
import { HomeContainer, StartButton, StopButton } from './styles'
import { NewCycleForm } from './NewCycleForm'
import { Countdown } from './Countdown'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import * as zod from 'zod'
import { useContext } from 'react'
import { CyclesContext } from '../../contexts/CyclesContext'

const newCycleFromValidationSchema = zod.object({
  task: zod.string().min(1, 'Inform the task'),
  minutesAmount: zod.number().min(5, 'Min 5 minutes').max(60, 'Max 60 minutes'),
})

type NewCycleFormData = zod.infer<typeof newCycleFromValidationSchema>

export function Home() {
  const { activeCycle, createNewCycle, interruptCycle } =
    useContext(CyclesContext)

  const newCycleForm = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFromValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { handleSubmit, watch, reset } = newCycleForm

  function handleCreateNewCycle(data: NewCycleFormData) {
    createNewCycle(data)
    reset()
  }

  const task = watch('task')
  const isTaskInputEmpty = task === '' // (or !task)

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <FormProvider {...newCycleForm}>
          <NewCycleForm />
        </FormProvider>
        <Countdown />

        {activeCycle ? (
          <StopButton onClick={interruptCycle} type="button">
            <HandPalm />
            Interrupt
          </StopButton>
        ) : (
          <StartButton disabled={isTaskInputEmpty} type="submit">
            <Play />
            Start
          </StartButton>
        )}
      </form>
    </HomeContainer>
  )
}
