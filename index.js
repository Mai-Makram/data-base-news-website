const express = require('express')
const app = express()
const port = process.env.PORT || 3000
//const Task = require('./models/newsModels')
//const User = require('./models/reportarModels')

require('./db/mongoose')

app.use(express.json())
const userRouter = require('./routers/reportarRouters')
const taskRouter = require('./routers/newsRouters')

app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{console.log('Listening on port 3000')})

