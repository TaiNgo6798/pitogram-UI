import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

//contexts provider
import UserContextProvider from '@contexts/userContext'
import PostContextProvider from '@contexts/postContext'
import DefaultValuesProvider from '@contexts/defaultValues'
import PostingModalProvider from '@contexts/postingModalContext'
import ChatBarProvider from '@contexts/chatBarContext'

//server
import ApolloClient from 'apollo-client'
// Setup the network "links"
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router } from 'react-router-dom'
import { setContext } from 'apollo-link-context'

const cache = new InMemoryCache()
const token = localStorage.getItem('Authorization')

const httpLink = new HttpLink({
	uri: process.env.GRAPHQL_URL, // use https for secure endpoint
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
	uri: process.env.SOCKET_URL, // use wss for a secure endpoint
	options: {
		reconnect: true,
		connectionParams: {
			Authorization: token,
		},
	},
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
	// split based on operation type
	({ query }) => {
		const { kind, operation } = getMainDefinition(query)
		return kind === 'OperationDefinition' && operation === 'subscription'
	},
	wsLink,
	httpLink,
)

const authLink = setContext((_, { headers }) => {
	// get the authentication token from local storage if it exists
	// return the headers to the context so httpLink can read them
	return {
		headers: {
			...headers,
			authorization: token || '',
		},
	}
})

// Instantiate client
const client = new ApolloClient({
	link: authLink.concat(link),
	cache,
})

ReactDOM.render(
	<ApolloProvider client={client}>
		<DefaultValuesProvider>
			<ChatBarProvider>
				<PostingModalProvider>
					<PostContextProvider>
						<UserContextProvider>
							<Router>
								<App />
							</Router>
						</UserContextProvider>
					</PostContextProvider>
				</PostingModalProvider>
			</ChatBarProvider>
		</DefaultValuesProvider>
	</ApolloProvider>,
	document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
