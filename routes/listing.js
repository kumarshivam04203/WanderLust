const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router(); 
const Listing= require("../models/listing");
const {isLoggedIn, isOwner, validateListing} = require("../middleware");

const listingController = require("../controllers/listings");
const multer  = require('multer');
const {storage} = require("../cloudConfig");
const upload = multer({storage});

router.route("/")
.get(wrapAsync(listingController.index))//index route
.post(isLoggedIn, //create route
    upload.single('listing[image]'),
    validateListing, 
    wrapAsync(listingController.createListing));



// new Route
router.get("/new",isLoggedIn, listingController.renderNewForm );


router.route("/:id")
.get(wrapAsync(listingController.showListing)) //show route
.put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing,      // update route
    wrapAsync(listingController.updateListing))
.delete( isLoggedIn, isOwner,                   //delete route
    wrapAsync(listingController.destroyListing));


// edit route
router.get("/:id/edit", isLoggedIn,isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;