const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// index method
module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings})
};
// new route
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};
// show route
module.exports.showListing =  async(req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",populate:{path: "author"} })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};
// create route
module.exports.createListing = async(req, res,next) => {
    
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing")
    // }
    
    // if(!newListing.title){
    //     throw new ExpressError(400,"Title is missing");
    // }
    // if(!newListing.description){
    //     throw new ExpressError(400,"Description is missing");
    // }
    // if(!newListing.location){
    //     throw new ExpressError(400,"Location is missing");
    // }

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send();
    
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing created!")
    res.redirect("/listings");
};

// edit route
module.exports.renderEditForm = async(req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/,w_250");

    res.render("listings/edit.ejs", {listing, originalImageUrl});
}
// update route
module.exports.updateListing = async(req, res) => {
    let {id} = req.params;
    let coordinate = await geocodingClient.forwardGeocode({
        query: `${req.body.listing.location}, ${req.body.listing.country}`,
        limit: 2,
    })
    .send();

    req.body.listing.geometry = coordinate.body.features[0].geometry;
    let updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing);

    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url, filename};
        updatedListing.save();
    }
    req.flash("success", "Listing Updated !!");
    res.redirect(`/listings/${id}`);
};


// module.exports.updateListing = async(req,res) => {
//     let{id} = req.params;

//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

//     if(typeof req.file !== "undefined"){
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = {url, filename};
//         await listing.save();
//     }
    
//     req.flash("success", "Listing Updated!")
//     res.redirect(`/listings/${id}`);
// };

// delete route
module.exports.destroyListing = async(req, res) => {
    let{id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted")
    res.redirect("/listings");
};