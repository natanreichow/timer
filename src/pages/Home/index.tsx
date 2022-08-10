import { Play } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { differenceInSeconds } from 'date-fns'

import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartButton,
  TaskInput,
} from './styles'

// Validation using Zod Library
const newCycleFromValidationSchema = zod.object({
  task: zod.string().min(1, 'Inform the task'),
  minutesAmount: zod.number().min(5, 'Min 5 minutes').max(60, 'Max 60 minutes'),
})

type NewCycleFormData = zod.infer<typeof newCycleFromValidationSchema>

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
}

// Form using react-form Library
export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const { register, handleSubmit, watch, reset } = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFromValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  // Find a cycle in which its ID is equal to the activeCycleId
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  // Countdown from timer
  useEffect(() => {
    let interval: number

    if (activeCycle) {
      interval = setInterval(() => {
        setAmountSecondsPassed(
          differenceInSeconds(new Date(), activeCycle.startDate),
        )
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  }, [activeCycle])

  // Create new Cycle
  function handleCreateNewCycle(data: NewCycleFormData) {
    const newCycle = {
      id: uuidv4(),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    setCycles((state) => [...state, newCycle])
    setActiveCycleId(newCycle.id)
    setAmountSecondsPassed(0)

    reset()
  }

  // Transforn Countdown from minutes to seconds
  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0
  const currentSeconds = activeCycle ? totalSeconds - amountSecondsPassed : 0

  const minutesAmount = Math.floor(currentSeconds / 60)
  const secondsAmount = currentSeconds % 60

  const minutes = String(minutesAmount).padStart(2, '0')
  const seconds = String(secondsAmount).padStart(2, '0')

  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes}:${seconds}`
    }
  }, [minutes, seconds, activeCycle])

  const task = watch('task')
  const isTaskInputEmpty = task === '' // (or !task)

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <FormContainer>
          <label htmlFor="task">I will work in</label>
          <TaskInput
            id="task"
            placeholder="your project/task name"
            list="task-suggestions"
            {...register('task')}
          />

          <datalist id="task-suggestions">
            <option value="Projeto 1" />
            <option value="Projeto 2" />
            <option value="Projeto 3" />
            <option value="Projeto 4" />
          </datalist>

          <label htmlFor="">for</label>
          <MinutesAmountInput
            type="number"
            id="minutesAmount"
            placeholder="00"
            step={5}
            max={60}
            {...register('minutesAmount', { valueAsNumber: true })}
          />

          <span>minutes.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>

        <StartButton disabled={isTaskInputEmpty} type="submit">
          <Play />
          Start
        </StartButton>
      </form>
    </HomeContainer>
  )
}
