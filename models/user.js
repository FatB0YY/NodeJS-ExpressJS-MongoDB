const { Schema, model } = require("mongoose")

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    cart: {
      items: [
        {
          count: {
            type: Number,
            required: true,
            default: 1,
          },
          courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
          },
        },
      ],
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
)

userSchema.methods.addToCart = function (course) {
  // клонирование массива
  const clonedItems = [...this.cart.items]
  const idx = clonedItems.findIndex((c) => {
    return c.courseId.toString() === course._id.toString()
  })

  if (idx >= 0) {
    clonedItems[idx].count = clonedItems[idx].count + 1
  } else {
    clonedItems.push({
      courseId: course._id,
      count: 1,
    })
  }
  this.cart = { items: clonedItems }
  return this.save()
}

userSchema.methods.removeFromCart = function (id) {
  let items = [...this.cart.items]
  const idx = items.findIndex((c) => {
    return c.courseId.toString() === id.toString()
  })

  if (items[idx].count === 1) {
    items = items.filter((c) => c.courseId.toString() !== id.toString())
  } else {
    items[idx].count--
  }
  this.cart = { items: items }
  return this.save()
}

userSchema.methods.clearCart = function () {
  this.cart = { items: [] }
  return this.save()
}

module.exports = model("User", userSchema)
