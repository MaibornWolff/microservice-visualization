import 'tachyons/css/tachyons.css'
import './html/style.css'

import('./SystemViewer.js').then(SystemViewer => {
  SystemViewer.load()
})
