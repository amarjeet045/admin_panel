const init = (office,officeId) => {
    handleProfileDetails(officeId);
    getProductList({officeId,limit:5},(products)=>{
        console.log(products)
        showProductList(products)
    });
}


