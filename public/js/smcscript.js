var SMC = (function() {

  //Libraries within the library
  var SMCRequest, SMCUtil, SMCSetup, SMCTemplate, SMCConstants;

  SMCRequest = (function() {
    var responseIsSuccess, sendProductRequest, searchWithPrice, loadUserFavorites, getAmazonResponseItem;

    getAmazonResponseItem = function(data) {
      var itemsParent, amazonReponseItem;
      if (data.hasOwnProperty('ItemSearchResponse')) {
        itemsParent = data.ItemSearchResponse;
      } else if (data.hasOwnProperty('ItemLookupResponse')) {
        itemsParent = data.ItemLookupResponse;
      }
      if (itemsParent) {
        if (itemsParent.hasOwnProperty('Items')
          && itemsParent.Items.length > 0
          && itemsParent.Items[0].Item) {
          amazonReponseItem = itemsParent.Items[0].Item;
        }
      }
      return amazonReponseItem;
    };

    responseIsSuccess = function(xhr) {
      return xhr.status && (xhr.status === 200 || xhr.status === 304);
    };

    searchWithPrice = function(price, itemPage, append) {
      append = append || false;
      var $moreButton = SMCTemplate.moreButton();
      $moreButton.click(function() {
        searchWithPrice(price, itemPage + 1, true);
      });
      sendProductRequest({
        type: 'GET',
        url: '/products?price=' + price + '&itemPage=' + itemPage
      }, append, 0, $moreButton, 'search');
    };

    loadUserFavorites = function(index, append) {
      index = index || 0;
      append = append || false;
      if (SMC.user && SMC.user.favorites) {
        var totalFavorites = SMC.user.favorites.length;
        if (totalFavorites < 0) {
          SMCUtil.showAlert('error', '<strong>Dang!</strong> It looks like you don\'t have any favorites. Give that a try!');
          return;
        } else if (totalFavorites < index) {
          SMCUtil.showAlert('', '<strong>That\'s it!</strong> These are all of your favorites. You could always add some more!');
          return;
        }
      }
      var $moreButton = SMCTemplate.moreButton();
      $moreButton.click(function() {
        loadUserFavorites(index + 10, true);
      });
      sendProductRequest({
        type: 'GET',
        url: '/users/me/favorites?index=' + index
      }, append, 0, $moreButton, 'favorites');
    };

    sendProductRequest = function(req, append, requestAttempt, moreButton, location) {
      SMCUtil.removeMoreButton();
      if (requestAttempt > SMCConstants.MAX_REQUEST_RETRIES) {
        SMCUtil.showAlert('error', '<strong>Ouch!</strong> We tried and tried, but couldn\'t get any results for you! If this happens several times, please let us know.')
      }
      SMCUtil.showLoadingGif();
      $.ajax({
        type: req.type,
        url: req.url,
        success: function(data, textStatus, xhr) {
          var amazonResponseItem;
          SMCUtil.hideLoadingGif();
          SMC.response = data;
          if (responseIsSuccess(xhr)) {
            amazonResponseItem = getAmazonResponseItem(data);
          }
          if (amazonResponseItem) {
            SMCSetup.setupProductView(amazonResponseItem, append, moreButton);
            SMCSetup.setupHover();
            SMC.location = location;
          } else {
            sendProductRequest(req, requestAttempt + 1, moreButton, location);
            SMCUtil.log(data);
          }
        },
        error: function(e) {
          SMCUtil.hideLoadingGif();
          SMCUtil.showAlert('error', '<strong>Whoops!</strong> There was a problem getting the products! If this happens a lot, let us know.');
          SMCUtil.log(e);
        }
      });
    };

    return {
      sendProductRequest: function(req, append, requestAttempt, moreButton, location) {
        sendProductRequest(req, append, requestAttempt, moreButton, location);
      },
      loadUserFavorites: function(index, append) {
        loadUserFavorites(index, append);
      },
      onSearch: function() {
        var userInput = $('#user-input-price').val();
        var numVersion = parseFloat(userInput.replace(/,/g, ''));
        if (_.isFinite(numVersion)) {
          searchWithPrice(userInput * 100, 1);
        } else if (userInput.toLowerCase() === 'favorites') {
          loadUserFavorites();
        } else {
          SMCUtil.showAlert('error', '<strong>Warning!</strong> Easy there tiger. We only do numbers.');
        }
      },
      loadSMCUser: function() {
        $.ajax({
          type: 'GET',
          url: '/users/me',
          success: function(data, textStatus, xhr) {
            SMC.response = data;
            if (data.hasOwnProperty('_id') && responseIsSuccess(xhr)) {
              SMC.user = data;
              SMCSetup.setupForUser();
              $('#favorites-button').show();
            }
          },
          error: function(e) {
            //User is not logged in.
            SMCUtil.log(e);
          }
        });
      },
      addFavorite: function(item) {
        $.ajax({
          type: 'PUT',
          url: '/users/me/favorites?ids=' + item.data('product-id'),
          success: function(data, textStatus, xhr) {
            SMC.response = data;
            if (responseIsSuccess(xhr)) {
              SMCUtil.showAlert('info', '<strong>Sweet!</strong> Another item on the favorites list.');
              SMC.user.favorites = data;
              item.data('is-favorite', true);
              item.attr('title', 'Remove from favorites');
            } else {
              SMCUtil.showAlert('error', '<strong>Sorry!</strong> Couldn\'t add that one for some reason!');
            }
          },
          error: function(e) {
            SMCUtil.showAlert('error', '<strong>Sorry!</strong> Couldn\'t add that one for some reason!');
            SMCUtil.log(e);
          }
        });
      },
      removeFavorite: function(item) {
        $.ajax({
          type: 'DELETE',
          url: '/users/me/favorites?ids=' + item.data('product-id'),
          success: function(data, textStatus, xhr) {
            SMC.response = data;
            if (responseIsSuccess(xhr)) {
              SMCUtil.showAlert('info', '<strong>Sayonara!</strong> That item is no longer a favorite.');
              SMC.user.favorites = data;
              if (SMC.location === 'favorites') {
                item.parents('.product-panel').remove();
              }
              item.data('is-favorite', false);
              item.attr('title', 'Save to favorites');
            } else {
              SMCUtil.showAlert('error', '<strong>Sorry!</strong> Couldn\'t remove that one for some reason!');
            }
          },
          error: function(e) {
            SMCUtil.showAlert('error', '<strong>Sorry!</strong> Couldn\'t remove that one for some reason!');
            SMCUtil.log(e);
          }
        });
      }
    };
  })();

  SMCUtil = (function() {
    return {
      validateUserInput: function(userInput) {
        this.log(userInput)
        if (((userInput || userInput === '') && !_.isFinite(userInput)) || userInput.toString().toLowerCase() === 'favorites') {
          return false;
        }
        return true;
      },
      removeMoreButton: function() {
        $('#more-button').remove();
      },
      shortenLongTitle: function(title) {
        return _.first(title, SMCConstants.MAX_TITLE_LENGTH).join('');
      },
      showLoadingGif: function() {
        $('.loading-image').css('visibility', 'visible');
      },
      hideLoadingGif: function() {
        $('.loading-image').css('visibility', 'hidden');
      },
      removeProductPanels: function() {
        $('.product-panel').remove();
      },
      showAlert: function(type, text) {
        var $alert = $('#alert-template').clone();
        var $alertContainer = $('#user-info-alert');
        $('#current-alert').remove();
        $alert.attr('id', 'current-alert');
        $alert.addClass('alert-' + type);
        $alert.html(text);
        $alert.css('visibility', 'visible');
        $alertContainer.append($alert);

        setTimeout(function() {
          $alert.css('visibility', 'hidden');
        }, 5000);
      },
      log: function(text) {
        if (this.logging) {
          console.log(text);
        }
      }
    };
  })();

  SMCConstants = (function() {
    return {
      MAX_REQUEST_RETRIES: 3,
      MAX_TITLE_LENGTH: 125,
      DEFAULT_TITLE: 'Title not provided',
      DEFAULT_MANUFACTURER: 'Unknown',
      DEFAULT_AMAZON_LINK_TEXT: 'URL not available'
    };
  })();

  SMCSetup = (function() {

    //The libraries within the library within the library... Inception...
    var ProductSetup, FavoritesSetup;

    ProductSetup = (function() {
      var getProductImageUrl, getProductTitle, getProductManufacturer, getProductDetails, getASIN;

      getProductImageUrl = function(product) {
        var imageUrl;
        if (product.LargeImage && product.LargeImage[0].URL && product.LargeImage[0].URL[0]) {
          imageUrl = product.LargeImage[0].URL[0];
        } else if (product.ImageSets && product.ImageSets[0].ImageSet) {
          try {
            imageUrl = product.ImageSets[0].ImageSet[0].LargeImage[0].URL[0];
          } catch (e) {
            imageUrl = '../public/img/No_image_available.png';
          }
        } else {
          imageUrl = '../public/img/No_image_available.png';
        }
        return imageUrl;
      };

      getProductTitle = function(product) {
        return product.ItemAttributes[0].Title || 'Title not provided.';
      };

      getProductManufacturer = function(product) {
        var manufacturer = SMCConstants.DEFAULT_MANUFACTURER;
        if (product.ItemAttributes[0].hasOwnProperty('Manufacturer')
          && product.ItemAttributes[0].Manufacturer.length > 0) {

          manufacturer = product.ItemAttributes[0].Manufacturer[0];
        }
        return manufacturer;
      };

      getProductDetails = function(product) {
        var detailPageUrl = '';
        var detailPageUrlDescription = SMCConstants.DEFAULT_AMAZON_LINK_TEXT;
        if (product.hasOwnProperty('DetailPageURL') && product.DetailPageURL.length > 0) {
          detailPageUrl = product.DetailPageURL[0];
          detailPageUrlDescription = 'See on Amazon';
        } else {
          detailPageUrl = '';
          detailPageUrlDescription = 'URL Unavailable';
        }
        return {
          detailPageUrl: detailPageUrl,
          detailPageUrlDescription: detailPageUrlDescription
        };
      };

      getASIN = function(product) {
        var ASIN;
        if (product.hasOwnProperty('ASIN') && product.ASIN.length > 0) {
          ASIN = product.ASIN[0];
        }
        return ASIN;
      };

      return {
        getProductFromAmazonResponsePortion: function(product) {
          var imageUrl, title, manufacturer, details, detailPageUrl, detailPageUrlDescription,
            ASIN;
          if (!product) {
            return;
          }

          imageUrl = getProductImageUrl(product);

          if (product.hasOwnProperty('ItemAttributes') && product.ItemAttributes.length > 0) {
            title = getProductTitle(product);
            manufacturer = getProductManufacturer(product);
          } else {
            title = SMCConstants.DEFAULT_TITLE;
            manufacturer = SMCConstants.DEFAULT_MANUFACTURER;
          }

          details = getProductDetails(product);
          detailPageUrl = details.detailPageUrl;
          detailPageUrlDescription = details.detailPageUrlDescription;

          ASIN = getASIN(product);

          return {
            ASIN: ASIN,
            imageUrl: imageUrl,
            title: title,
            manufacturer: manufacturer,
            detailPageUrl: detailPageUrl,
            detailPageUrlDescription: detailPageUrlDescription
          };
        }
      }
    })();

    FavoritesSetup = (function() {
      var onHover, offHover, onClick, isFavorite, getProductId, starOn, starOff;
      var fullStarClass = 'icon-star';
      var emptyStarClass = 'icon-star-empty';
      var productIdData = 'product-id';
      var isFavoriteData = 'is-favorite';

      starOn = function(obj) {
        obj.addClass(fullStarClass);
        obj.removeClass(emptyStarClass);
      };

      starOff = function(obj) {
        obj.removeClass(fullStarClass);
        obj.addClass(emptyStarClass);
      };

      getProductId = function(obj) {
        return obj.data(productIdData);
      };

      isFavorite = function(obj) {
        return obj.data(isFavoriteData);
      };

      onHover = function(obj) {
        if (isFavorite(obj)) {
          starOff(obj);
        } else {
          starOn(obj);
        }
      };

      offHover = function(obj) {
        if (isFavorite(obj)) {
          starOn(obj);
        } else {
          starOff(obj);
        }
      };

      onClick = function(obj) {
        if (isFavorite(obj)) {
          SMCRequest.removeFavorite(obj);
        } else {
          SMCRequest.addFavorite(obj);
        }
      };

      init = function(obj) {
        if (isFavorite(obj)) {
          obj.addClass(fullStarClass);
          obj.removeClass(emptyStarClass);
          obj.attr('title', 'Remove from favorites');
        }
      }

      return {
        setup: function() {
          $('.favorites-link').each(function() {
            $(this).hover(function() {
              onHover($(this));
            }, function() {
              offHover($(this));
            });
            $(this).click(function() {
              onClick($(this));
            });
            init($(this));
          });
        }
      };
    })();

    return {
      bindEventHandlers: function() {
        $('#user-input-price').keypress(function(e) {
          if (e.which === 13) {
            SMCRequest.onSearch();
          }
        });

        $('#search-button').click(function() {
          SMCRequest.onSearch();
        });

        $('#favorites-button').click(function() {
          $('#user-input-price').val('Favorites');
          SMCRequest.onSearch();
        });
      },
      setupHover: function() {
        $('.hover').hover(function() {
          $(this).addClass('flip');
        }, function() {
          $(this).removeClass('flip');
        });
      },
      setupForUser: function() {
        $('#user-status-button').html(SMC.user['name']);
        $('li.login').remove();

        var logoutHTML = '<li class="logout"><span class="logout"><h5>All done? Click below to sign out.</h5></span></li>' +
          '<li class="logout divider"></li>' +
          '<li class="logout"><span><a href="/auth/logout" id="logout-button" class="btn">' +
          'Sign Out' +
          '</a></span></li>';

        $('#login-dropdown').append(logoutHTML);
      },
      setupProductView: function(amazonProductsResponse, append, moreButton) {
        var i, $productContainer;
        if (!append) {
          SMCUtil.removeProductPanels();
        }
        SMCUtil.hideLoadingGif();

        for (i = 0; i < amazonProductsResponse.length; i += 1) {
          var productResponseItem, productPanelTemplate, product;

          productResponseItem = amazonProductsResponse[i];
          product = ProductSetup.getProductFromAmazonResponsePortion(productResponseItem);

          productPanelTemplate = SMCTemplate.productPanel(product);

          $productContainer = $('#product-container');

          $productContainer.append(productPanelTemplate);
          if (moreButton) {
            $productContainer.append(moreButton);
          }
        }
        if (SMC.user) {
          FavoritesSetup.setup();
        }
      }
    };
  })();

  SMCTemplate = (function() {
    return {
      productPanel: function(product) {
        var isFavorite, favoritesLinkHtml = '';
        if (SMC.user && product.ASIN) {
          isFavorite = _.contains(SMC.user.favorites, product.ASIN);
          favoritesLinkHtml = '<br /><br />' +
            '<i class="favorites-link icon-star-empty" title="Save to Favorites" data-product-id="'
            + product.ASIN + '" data-is-favorite="' + isFavorite + '"></i>';
        }
        return '<div id="' + product.ASIN + '"class="hover product-panel">' +
          '<div class="front">' +
          '<img class="product-image thumb" src="' + product.imageUrl + '">' +
          '</div>' +
          '<div class="back">' +
          '<div class="product-info">' +
          '<p>' +
          '<span class="product-title">' + SMCUtil.shortenLongTitle(product.title) + '</span>' +
          '</p>' +
          '<p>' +
          '<span class="product-manufacturer"><strong>Made By:</strong> &nbsp;' + product.manufacturer + '</span>' +
          '</p>' +
          '<p class="product-link">' +
          '<a href="' + product.detailPageUrl + '" target="_blank">' + product.detailPageUrlDescription + '</a>' +
          favoritesLinkHtml +
          '</p>' +
          '</div>' +
          '</div>' +
          '</div>';
      },
      moreButton: function() {
        return $('<div id="more-button"><button class="btn">Load more...</button></div>');
      }
    };
  })();

  return {
    user: undefined,
    setupApp: function() {
      SMCSetup.bindEventHandlers();
      SMCRequest.loadSMCUser();
    },
    enableLogging: function() {
      SMCUtil.logging = true;
      SMCUtil.log('Logging now enabled');
    }
  }
})();

/******** App setup ********/

$(document).ready(function() {
  SMC.setupApp();
});
