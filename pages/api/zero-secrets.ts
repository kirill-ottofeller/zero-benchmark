// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import {zero} from '@zerosecrets/zero'

type Data = {
  secrets: {name: string, value: string}[]
  totalTime: number
  averageTime: number
  medianTime: number
  error: string | null
}

const calcMedian = (list: number[]) => {
  if(list.length === 0) {
    return 0
  }

  const sortedList = list.sort((left, right) => left - right)
  const half = Math.floor(sortedList.length / 2)

  if(list.length % 2 !== 0) {
    return list[half]
  }

  return (list[half - 1] + list[half]) / 2
}

const sum = (list: number[]) => list.reduce((result, item) => result + item, 0)

const calcAverage = (list: number[]) => (
  sum(list) / list.length
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = JSON.parse(req.body)
  let secrets: Data['secrets'] = []
  const times: number[] = []


  if(body.sequence) {
    try {
      for (let i = 0; i < body.counter; i++) {
        const t1 = performance.now()

        secrets.push(
          ...Object.values(await zero({token: body.token, apis: body.apis}).fetch())
            .flatMap(secretValue => Object.entries(secretValue).flatMap(([name, value]) => ({name, value})))
        )

        const t2 = performance.now()
        times.push(t2 - t1)
      }
    }catch(error) {
      return res.status(200).json({
        error: JSON.stringify({error}, undefined, 2),
        secrets,
        totalTime: sum(times),
        averageTime: calcAverage(times),
        medianTime: calcMedian(times),
      })
    }
  }

  try {
    secrets = (await Promise.all(
      new Array(parseInt(body.counter))
        .fill(body)
        .map(async ({token, apis}) => zero({token, apis}).fetch())
    ))
      .flatMap(secrets => Object.values(secrets)
        .flatMap(secretsValues => Object.entries(secretsValues)
        .flatMap(([name, value]) => ({name, value})))
      )
  }catch(error) {
    return res.status(200).json({
      error: JSON.stringify({error}, undefined, 2),
      secrets,
      totalTime: sum(times),
      averageTime: calcAverage(times),
      medianTime: calcMedian(times),
    })
  }

  res.status(200).json({
    secrets,
    totalTime: sum(times),
    averageTime: calcAverage(times),
    medianTime: calcMedian(times),
    error: null,
  })
}
