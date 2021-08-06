const express = require("express")
const path = require("path")
const exphbs = require("express-handlebars")
// mongoose
const mongoose = require("mongoose")

// регестрируем роут
const homeRoutes = require("./routes/home")
const addRoutes = require("./routes/add")
const coursesRoutes = require("./routes/courses")
const cardRoutes = require("./routes/card")
const ordersRoutes = require("./routes/orders")
// user
const User = require("./models/user")

const app = express()

// создаем конфигурацию handlebars
const hbs = exphbs.create({
  // основной лэйаут
  defaultLayout: "main",
  // название extension, по умолчанию handlebars
  extname: "hbs",
})

// теперь, чтобы зарегестрировать данный модуль как движок
// для рендеринга html страниц:
// первый - название движка
app.engine("hbs", hbs.engine) // регестрируем в express что есть такой движок
app.set("view engine", "hbs") // мы его уже начинаем использовать
// указываем вторым параметром название папки, где будут храниться наши шаблоны
app.set("views", "pages")

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("610bbdf89a207303cc1908ab")
    req.user = user
    next()
  } catch (error) {
    console.log(error)
  }
})

// делаем папку public статической
app.use(express.static(path.join(__dirname, "public")))

// для того, чтобы обработать форму и не получить пустой объект:
// в nodeJS это прослушка события буффера и т.д
app.use(express.urlencoded({ extended: true }))

// также мы можем задавать префиксы
// это префиксы пути для роутов
app.use("/", homeRoutes)
app.use("/add", addRoutes)
app.use("/courses", coursesRoutes)
app.use("/card", cardRoutes)
app.use("/orders", ordersRoutes)

const PORT = process.env.PORT || 4000
// подключение к MongoDB
async function start() {
  try {
    const url = `mongodb+srv://rodion_admin:********@cluster0.2le6m.mongodb.net/shop?retryWrites=true&w=majority`
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })

    const candidate = await User.findOne()
    if (!candidate) {
      const user = new User({
        email: "rodion-web@yandex.ru",
        name: "Rodion",
        cart: { items: [] },
      })
      await user.save()
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}
start()
