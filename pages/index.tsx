import dayjs from 'dayjs'
import type { NextPage } from 'next'
import Head from 'next/head'
import { FormEventHandler, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [data, setData] = useState({secrets: [], timestamp: 0, error: null})
  const [isLoading, setIsLoading] = useState(false)

  const showSecrets: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault()
    setIsLoading(true)

    fetch('api/zero-secrets', {method: "POST", body: JSON.stringify({
      token: tokenRef.current?.value ?? '',
      apis: apisRef.current?.value.split(',').map(api => api.trim()) ?? [],
      counter: counterRef.current?.value ?? 0,
    }, undefined, 2)})
      .then(response => response.json())
      .then(result => setData(result))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }

  const tokenRef = useRef<HTMLInputElement>(null)
  const apisRef = useRef<HTMLInputElement>(null)
  const counterRef = useRef<HTMLInputElement>(null)

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
            Token:
            <input ref={tokenRef} type="text" name="token"  />
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

        {data.error && !isLoading && <div style={{margin: '20px', maxWidth: "80%", backgroundColor: "#999", color: "#fff", overflow: 'auto'}}>
          <pre>{data.error}</pre>
        </div>}

        {!isLoading && <>
          <ul style={{maxHeight: '500px', overflow: 'auto'}}>
            {data.secrets.map(({name, value}, index) => <li key={index}>{index + 1}. {name}: {value}</li>)}
          </ul>

          <small>{data.timestamp / 1000} sec</small>
        </>}
      </main>
    </div>
  )
}

export default Home
