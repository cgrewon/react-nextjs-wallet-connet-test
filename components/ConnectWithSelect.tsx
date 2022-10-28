import type { Web3ReactHooks } from '@web3-react/core'
import type { MetaMask } from '@web3-react/metamask'
import { ChangeEvent, useCallback, useState } from 'react'
import { CHAINS, getAddChainParameters } from '../chains'

function ChainSelect({
  chainId,
  switchChain,
  displayDefault=true,
  chainIds,
}: {
  chainId: number
  switchChain: (chainId: number) => void | undefined
  displayDefault?: boolean
  chainIds: number[]
}) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    switchChain?.(Number(event.target.value))
  }
  return (
    <select
      value={chainId}
      onChange={handleChange}
      disabled={switchChain === undefined}
    >
      {displayDefault ? <option value={-1}>Default Chain</option> : null}
      {chainIds.map((chainId) => (
        <option key={chainId} value={chainId}>
          {CHAINS[chainId]?.name ?? chainId}
        </option>
      ))}
    </select>
  )
}

export function ConnectWithSelect({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
}: {
  connector: MetaMask
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
}) {
  const chainIds = (Object.keys(CHAINS)).map((chainId) => Number(chainId))

  const [desiredChainId, setDesiredChainId] = useState<number>( -1)

  const switchChain = useCallback(
    (desiredChainId: number) => {
      setDesiredChainId(desiredChainId)
      if (desiredChainId === chainId) {
        setError(undefined)
        return
      }

      if (desiredChainId === -1 && chainId !== undefined) {
        setError(undefined)
        return
      }

        connector
          .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
          .then(() => setError(undefined))
          .catch(setError)
    },
    [connector, chainId, setError]
  )

  const onClick = useCallback((): void => {
    setError(undefined)
      connector
        .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
        .then(() => setError(undefined))
        .catch(setError)
    // }
  }, [connector, desiredChainId, setError])

  const handleDisconnect = ()=>{
      if (connector?.deactivate) {
        void connector.deactivate()
      } else {
        void connector.resetState()
      }
  }

  const handleConnect = () => {
    connector
      .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
      .then(() => setError(undefined))
      .catch(setError)
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
          <ChainSelect
            chainId={desiredChainId}
            switchChain={switchChain}
            
            chainIds={chainIds}
          />
        
        <div style={{ marginBottom: '1rem' }} />
        <button onClick={onClick}>Try Again?</button>
      </div>
    )
  } else if (isActive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
          <ChainSelect
            chainId={desiredChainId === -1 ? -1 : chainId}
            switchChain={switchChain}
            
            chainIds={chainIds}
          />
        
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    )
  } else {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
          <ChainSelect
            chainId={desiredChainId}
            switchChain={isActivating ? undefined : switchChain}
            chainIds={chainIds}
          />
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={handleConnect}
          disabled={isActivating}
        >
          Connect
        </button>
      </div>
    )
  }
}
