import React, { useContext, lazy, Suspense, useMemo, useEffect } from 'react'
import { Switch, Route, withRouter, Redirect } from 'react-router-dom'
import { privateRouters, publicRoutes, gayRoutes } from '../configs'

import ChatBar from '@components/chatBar'
import NavBar from '@components/nav'

import { UserContext } from '@contexts/userContext'

import _ from 'lodash'
import { useState } from 'react'

function Index() {
  const { decodeToken, refreshUser } = useContext(UserContext)
  const [canAccess, setCanAccess] = useState(decodeToken());

  const verifyAccess = async () => {
      if(decodeToken()){
        const response = await refreshUser()
        const user = response['data']['getUserByID'] || {}
        setCanAccess(!_.isEmpty(user))
      } else setCanAccess(false);
  }

  useEffect(() => {
    verifyAccess()
  }, [])

  const Nav = useMemo(() => {
    return canAccess ? (
      <>
        <NavBar logged={true} />
      </>
    ) : (
      <NavBar logged={false} />
    )
  }, [canAccess])

  const SwitchBoy = useMemo(() => {
    return (
      <Switch>
        {gayRoutes.map((route, idx) => (
          <Route
            key={idx}
            exact={route.exact}
            path={route.path}
            render={() => {
              const Component = lazy(() =>
                import(`../pages/${route.component}`),
              )
              return <Component />
            }}
          />
        ))}
        {privateRouters.map((route, idx) => (
          <Route
            key={route.key || idx}
            exact={route.exact}
            path={route.path}
            render={() => {
              if (!canAccess) {
                location.href = '/login'
              } else {
                const Component = lazy(() =>
                  import(`../pages/${route.component}`),
                )
                return <Component />
              }
            }}
          />
        ))}
        {publicRoutes.map((route, idx) => (
          <Route
            key={idx}
            exact={route.exact}
            path={route.path}
            render={() => {
              if (canAccess) {
                return <Redirect to="/" />
              } else {
                const Component = lazy(() =>
                  import(`../pages/${route.component}`),
                )
                return <Component />
              }
            }}
          />
        ))}
        <Redirect to="/" />
      </Switch>
    )
  }, [canAccess])

  return (
    <>
      {['admin', 'login'].indexOf(
        window.location.href.split('/').reverse()[0],
      ) === -1 && (
        <>
          {Nav}
          {canAccess && <ChatBar />}
        </>
      )}
      <Suspense fallback={'loading...'}>{SwitchBoy}</Suspense>
    </>
  )
}

export default withRouter(Index)
