const init = (office,officeId) => {
    handleProfileDetails(officeId);
    getProductList({officeId,limit:5},(products)=>{
        showProductList(products)
    });
}


