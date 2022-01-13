const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// Geocode & create location field
BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address)
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipCode,
    country: loc[0].countryCode,
  }

  // Do not save address in DB
  this.address = undefined
  next()
})

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
  console.log(`Courses being removed from bootcamp ${this._id}`)
  await this.model('Course').deleteMany({ bootcamp: this._id })
  next()
})

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)

// ** NOTES **
// required: [true, 'custom message']
// url friendly string DevCenter Bootcamp -> devcenter-bootcamp
// match: [regex, ] custom validation
// 31.1. Geocoder doc  https://www.npmjs.com/package/node-geocoder

// 39.1. Virtuals are document properties that you can get and set but that do not get persisted to MongoDB.
// 39.1.1. { toJSON: { virtuals: true }, toObject: { virtuals: true } }
// 39.1.2. Schema.virtual(fieldName, options)
// 39.1.3. options: { ref: model, localField: id, foreignField: refField, justOne: false <- retun array}
// 39.2. Cascade delete
// 39.2.1. Schema.pre('remove', async function(next) {})
// 39.2.2. In the this.model('Course') part,  'this' refers to the bootcamp document being deleted, and we use the 'model' method (https://mongoosejs.com/docs/api.html#connection_Connection-model) in order to retrieve the document related to the Course model. This way the 'courses' document gets retrieved and the deletemany() method is applied to those courses that have a matching bootcamp-id.
