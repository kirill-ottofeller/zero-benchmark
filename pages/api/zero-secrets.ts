// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import {zero} from '@zerosecrets/zero'

type Data = {
  secrets: {name: string, value: string}[]
  totalTime: number
  averageTime: number
  error: string | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = JSON.parse(req.body)
  const t1 = performance.now()
  let secrets: Data['secrets'] = []

  try {
    secrets = (await Promise.all(
      new Array(parseInt(body.counter))
        .fill(body)
        .map(async ({token, apis}) => zero({token, apis}).fetch())))
        .flatMap(secrets => Object.values(secrets)
          .flatMap(secretsValues => Object.entries(secretsValues)
          .flatMap(([name, value]) => ({name, value})))
        )
  }catch(error) {
    const t2 = performance.now()
    return res.status(200).json({
      error: JSON.stringify({error}, undefined, 2),
      secrets,
      totalTime: t2 - t1,
      averageTime: (t2 - t1) / body.counter
    })
  }

  const t2 = performance.now()

  res.status(200).json({
    secrets,
    totalTime: t2 - t1,
    averageTime: (t2 - t1) / body.counter,
    error: null
  })
}
