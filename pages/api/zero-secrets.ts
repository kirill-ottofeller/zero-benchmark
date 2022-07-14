// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import {zero} from '@zerosecrets/zero'

type Data = {
  secrets: {name: string, value: string}[]
  timestamp: number
  error: string | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = JSON.parse(req.body)
  let secrets: Data['secrets'] = []

  const t1 = performance.now();

  try {
    secrets = Object.values(await zero({token: body.token, apis: body.apis}).fetch())
      .flatMap(values => Object.entries(values).flatMap(([name, value]) => ({name, value})))
  }catch(error) {
    return res.status(200).json({
      error: JSON.stringify({error}, undefined, 2),
      secrets,
      timestamp: performance.now() - t1,
    })
  }

  res.status(200).json({
    secrets,
    timestamp: performance.now() - t1,
    error: null,
  })
}
