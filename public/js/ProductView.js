SMC.setupProductView = function (products) {
  
  var i;
  $('.product-panel').remove();
  $('.loading-image').hide();
  console.log(products);
  for (i = 0; i < products.length; i += 1) {
    var product, imageURL, title, manufacturer, detailPageURL, detailPageURLDescription, 
        productPanelTemplate, saveAsFavoriteURL, favoritesLinkHTML;
    
    product = products[i];
    
    //due to sometimes not having all the data, we need to check for non-exisiting values
    
    if(product.LargeImage && product.LargeImage[0].URL && product.LargeImage[0].URL) {
      imageURL = product.LargeImage[0].URL[0];
    } else if (product.ImageSets && product.ImageSets[0].ImageSet){
      try {
        imageURL = product.ImageSets[0].ImageSet[0].LargeImage[0].URL[0];
      } catch (e) {
        imageURL = "../public/img/No_image_available.png";
      }
    } else {
      imageURL = "../public/img/No_image_available.png";
    }
    
    if (product.ItemAttributes && product.ItemAttributes[0].Title) {
      title = product.ItemAttributes[0].Title[0];
      // if (title.length > )
    } else {
      title = "Title not provided.";
    }
    
    if (product.ItemAttributes && product.ItemAttributes[0] && product.ItemAttributes[0].Manufacturer) {
      manufacturer = product.ItemAttributes[0].Manufacturer[0];
    } else {
      manufacturer = "Unknown";
    }
    
    if (product.DetailPageURL) {
      detailPageURL = product.DetailPageURL[0];
      detailPageURLDescription = "See on Amazon";
    }else {
      detailPageURL = "";
      detailPageURLDescription = "URL Unavailable";
    }
    
    if (SMC.user) {
      saveAsFavoriteURL = "/users/me/favorites";
      productId = product.ASIN[0];
      
      favoritesLinkHTML = "&nbsp;|&nbsp;" +
                      "<a href=\"" + saveAsFavoriteURL + "\" target=\"_blank\" onclick='setFavorite(" + 
                      product.ASIN[0] + ")'>Save as Favorite</a>";
      
    } else {
      favoritesLinkHTML = "";
    }
    
    
    
    productPanelTemplate =
        "<div class='hover product-panel'>" +
            "<div class='front'>"+
                "<img class=\"product-image thumb\" src=\"" + imageURL + "\">" +    
            "</div>" + 
            "<div class='back'>" +
                "<div class='product-info'>" +
                    "<p>" +
                        "<span class='product-title'>" + title + "</span>" +
                    "</p>" +
                    "<p>" +
                      "<span class='product-manufacturer'>Made By: &nbsp;" + manufacturer + "</span>" +
                    "</p>" +
                    "<p>" +
                      "<a href=\"" + detailPageURL + "\" target=\"_blank\">" + detailPageURLDescription + "</a>" +
                      favoritesLinkHTML +
                    "</p>" +
                "</div>"+
            "</div>" + 
        "</div>";
    
        
    $('#product-container').append(productPanelTemplate);
  }
  
};

SMC.shortenLongTitle = function (title) {
  
};
