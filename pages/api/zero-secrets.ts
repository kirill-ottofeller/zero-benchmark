// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  secrets: {name: string, value: string}[]
  timestamp: number
  error: string | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const t1 = performance.now()
  let secrets: Data['secrets'] = []

  try {
    secrets = (await Promise.all((await Promise.all(new Array(100).fill(null).map(
      () => fetch(
        'https://core.tryzero.com/v1/graphql',
        {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"query":"query {\n\tsecrets(zeroToken: \"4242dc44-76dc-4f1a-99af-84e0176daac6\", pick: [\"token-for-token-4\"]) {\n\t\tid\n\t\tname\n\n\t\tfields {\n\t\t\tname\n\t\t\tvalue\n\t\t}\n\t}\n}\n"}, undefined, 2)}
      )
    ))).map(async response => {
      try {
        return await response.json()
      }catch(error) {
        console.error('awesome json error')
      }
    })
    )).map((result) => {
      return result.data.secrets?.[0]?.fields?.[0]
    })
  }catch(error) {
    console.error(error)
    const t2 = performance.now()
    return res.status(200).json({error: JSON.stringify({error}, undefined, 2), secrets, timestamp: t2 - t1})
  }

  console.log(secrets)

  const t2 = performance.now()
  return res.status(200).json({secrets, timestamp: t2 - t1, error: null})
}
