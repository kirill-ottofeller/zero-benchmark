import { responsePathAsArray } from 'graphql'
import type { NextPage } from 'next'
import Head from 'next/head'
import { FormEventHandler, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'

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

const Home: NextPage = () => {
  const [isSequence, setIsSequence] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{name: string, value: string}[]>([]);
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleIsSequence = () => setIsSequence(prev => !prev)

  const tokenRef = useRef<HTMLInputElement>(null)
  const apisRef = useRef<HTMLInputElement>(null)
  const counterRef = useRef<HTMLInputElement>(null)

  const showSecrets: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault()
    setIsLoading(true)
    setData([])

    if(!counterRef.current) {
      return
    }

    if(!tokenRef.current) {
      return
    }

    if(!apisRef.current) {
      return
    }

    fetch('/api/zero-secrets', {method: 'POST', body:JSON.stringify({
      token: tokenRef.current.value,
      apis: apisRef.current.value.split(','),
      counter: counterRef.current.value,
    }, undefined, 2)}).then(response => response.json()).then(({secrets}) => {
        setIsLoading(false)
        setData(secrets)
    }).catch(error => setError(error))
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <form style={{display: 'grid', rowGap: '10px'}} onSubmit={showSecrets}>
          <label>
            Sequence:
            <input onClick={toggleIsSequence} value={isSequence ? 'on': 'off'} type="checkbox" />
          </label>

          <label>
            Token:
            <input ref={tokenRef} type="text" name="token" />
          </label>

          <label>
            Pick:
            <input ref={apisRef} type="text" name="apis" />
          </label>

          <label>
            Times:
            <input ref={counterRef} type="number" name="counter" />
          </label>

          <button type="submit">show secrets</button>
        </form>

        {isLoading && 'Loading...'}

        {error && !isLoading && <div style={{margin: '20px', maxWidth: "80%", backgroundColor: "#999", color: "#fff", overflow: 'auto'}}>
          <pre>{error}</pre>
        </div>}

        {!isLoading && <>
          <ul style={{maxHeight: '500px', overflow: 'auto'}}>
            {data.map(({name, value}, index) => <li key={index}>{index + 1}. {name}: {value}</li>)}
          </ul>

          <div>
            <small>total: {sum(timestamps)} ms</small>
            <br />
            <small>average: {calcAverage(timestamps)} ms</small>
            <br />
            <small>median: {calcMedian(timestamps)} ms</small>
          </div>
        </>}
      </main>
    </div>
  )
}

export default Home
