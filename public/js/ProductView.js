SMC.setupProductView = function (products, append) {

  var i;
  if (!append) {
    SMC.removeProductPanels();
  }
  SMC.hideLoadingGif();

  for (i = 0; i < products.length; i += 1) {
    var product, imageURL, title, manufacturer, detailPageURL, detailPageURLDescription,
        productPanelTemplate, favoritesLinkHTML, productId, isFavorite;

    product = products[i];

    //due to sometimes not receiving all the data we need to check for non-exisiting values

    if (product.LargeImage && product.LargeImage[0].URL && product.LargeImage[0].URL[0]) {
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
    } else {
      detailPageURL = "";
      detailPageURLDescription = "URL Unavailable";
    }

    if (SMC.user) {
      productId = product.ASIN[0];
      isFavorite = _.contains(SMC.user.favorites, productId);
      favoritesLinkHTML = "<br/><br/>" +
                      "<i class='favorites-link icon-star-empty' title='Save to Favorites' data-product-id='"
                      + productId + "' data-is-favorite='" + isFavorite + "'></i>";

    } else {
      favoritesLinkHTML = "";
    }



    productPanelTemplate =
        "<div id='" + product.ASIN[0] + "'class='hover product-panel'>" +
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
                    "<p class='product-link'>" +
                      "<a href=\"" + detailPageURL + "\" target=\"_blank\">" + detailPageURLDescription + "</a>" +
                      favoritesLinkHTML +
                    "</p>" +
                "</div>"+
            "</div>" +
        "</div>";


    $('#product-container').append(productPanelTemplate);
  }
  if (SMC.user) {
    SMC.setupFavoriteStars();
  }
};

SMC.sendSearchRequest = function (userInput, requests) {
  userInput = userInput * 100;
  $('.product-panel').remove();
  SMC.displayLoadingGif();

  $.ajax({
    type: "GET",
    url: "/products?price="+userInput,
    success: function(res){

      SMC.response = res;

      if(res.hasOwnProperty('ItemSearchResponse')
        && res.ItemSearchResponse.hasOwnProperty('Items')
        && res.ItemSearchResponse.Items[0].hasOwnProperty('Item')
        && res.ItemSearchResponse.Items[0].Item) {
        SMC.setupProductView(res.ItemSearchResponse.Items[0].Item);
        SMC.setupHover();
      } else {
        SMC.hideLoadingGif();
        SMC.showAlert("error", "<strong>Odd...</strong> We weren't able to get any results. Please try again.");
      }

    },
    error: function(e){

    }
  });
};


SMC.shortenLongTitle = function (title) {

};

