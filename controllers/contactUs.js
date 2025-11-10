const contactUs = require("../models/contactUs")

const addCustomerContactDetails = async(req,res) => {
    const { customerName, customerEmail, question } = req.body;
    console.log(req.body)

    const addCustomerDetails = await contactUs.create({
            customerName,
            customerEmail,
            question
    })      
  
    if(!addCustomerDetails){
        return res.status(400).json({ success: false, message: "Customer not added successfullt "})
    }

    return res.status(201).json({ success: true, message: "Customer details added successfully!"})

}

const getCustomerContactDetails = async(req,res) => {

    const { page = 1, limit = 9, sort = "createdAt:desc" } = req.query;

    let sortOptions = { createdAt: -1 };
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions = { [key]: order === "asc" ? 1 : -1 };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

   const getCustomerDetails = await contactUs.find().sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)

    const totalCustomers = await contactUs.countDocuments(getCustomerDetails);
    const totalPages = Math.ceil(totalCustomers / limitNumber);

   if(!getCustomerDetails){
     return res.status(400).json({ success: false, message: "Customer details are not fetched successfully!"})
   }

   return res.status(200).json({ success: true, 
    data: getCustomerDetails,
     totalCustomers,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
       message: "Customer details are fetched successfully!"})
}

module.exports = {
    addCustomerContactDetails,
    getCustomerContactDetails
}