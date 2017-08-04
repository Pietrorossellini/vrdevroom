if (process.env.NODE_ENV !== 'production') require('../public/index.html') // live reload index.html (not in prod)

import {start} from './main'

window.onload = start
