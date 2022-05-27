export const gayRoutes = [
	// kieu gi cung choi
	{
		exact: true,
		path: '/profile/:userID',
		component: 'profile',
	},
	{
		exact: true,
		path: '/post/:postID',
		component: 'onePost',
	},
	{
		exact: true,
		path: '/admin',
		component: 'admin',
	},
	{
		exact: true,
		path: '/',
		component: 'home',
	},
	{
		exact: true,
		path: '/profile/:userID',
		component: 'profile',
	},
	{
		exact: true,
		path: '/s/photos/:keywords',
		component: 'searchPhotoResult',
	},
]

export const publicRoutes = [
	// route khong login
	{
		exact: true,
		path: '/login',
		component: 'login',
	},
]

export const privateRouters = [
	// route can login

	{
		exact: true,
		path: '/messenger',
		component: 'messenger',
	},
]
