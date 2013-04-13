SMC.setupProductView = function (products) {
  
  var i = 0;
  $('.product-panel').remove();
  
  for (i; i < products.length; i += 1) {
    var product, imageURL, title, manufacturer, detailPageURL, detailPageURLDescription, template;
    
    product = products[i];
    
    //due to sometimes not having all the data, we need to check for null values
    if(product.LargeImage[0].URL[0]) {
      imageURL = product.LargeImage[0].URL[0];
    }
    
    if (product.ItemAttributes[0].Title[0]) {
      title = product.ItemAttributes[0].Title[0];
    }
    
    if (product.ItemAttributes[0].Manufacturer[0]) {
      manufacturer = product.ItemAttributes[0].Manufacturer[0];
    }
    
    if (product.DetailPageURL[0]) {
      detailPageURL = product.DetailPageURL[0];
    }else {
      detailPageURL = "";
      detailPageURLDescription = "URL Unavailable";
    }
    
    template =
        "<div class='hover product-panel'>" +
            "<div class='front'>"+
                "<img class=\"product-image thumb\" src=\"" + imageURL + "\">" +    
            "</div>" + 
            "<div class='back'>" +
                "<span class='product-title'>" + title + "</span><br/>" +
                "<span class='product-manufacturer'>" + manufacturer + "</span>" +
                "<a href=\"" + detailPageURL + "\" target=\"_blank\">" + detailPageURLDescription + "</a>" +
            "</div>" + 
        "</div>";
    $('#results-container').append(template);
  }
  
}
