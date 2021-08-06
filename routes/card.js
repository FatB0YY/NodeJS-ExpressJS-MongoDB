const { Router } = require("express")
const Course = require("../models/course")
const router = Router()

function mapCartItems(cart) {
  return cart.items.map((c) => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count,
  }))
}

function computePrice(courses) {
  return courses.reduce((total, course) => {
    return (total += course.price * course.count)
  }, 0)
}

router.get("/", async (req, res) => {
  const user = await req.user.populate("cart.items.courseId").execPopulate()

  const courses = mapCartItems(user.cart)

  res.render("card", {
    isCard: true,
    title: "Корзина",
    courses: courses,
    price: computePrice(courses),
  })
})

router.post("/add", async (req, res) => {
  // получаем объект того курса, который нам необходимо добавить
  const course = await Course.findById(req.body.id)
  await req.user.addToCart(course)
  res.redirect("/card")
})

router.delete("/remove/:id", async (req, res) => {
  await req.user.removeFromCart(req.params.id)
  const user = await req.user.populate("cart.items.courseId").execPopulate()

  const courses = mapCartItems(user.cart)

  const cart = {
    courses: courses,
    price: computePrice(courses),
  }

  res.status(200).json(cart)
})

module.exports = router
