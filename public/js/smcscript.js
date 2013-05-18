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

    searchWithPrice = function(price, searchIndex, itemPage, appending) {
      var $moreButton;
      var noMoreStuff = ((itemPage + 1) > SMCConstants.MAX_ITEM_PAGES);
      if (!noMoreStuff) {
        $moreButton = SMCTemplate.moreButton();
        $moreButton.click(function() {
          searchWithPrice(price, searchIndex, itemPage + 1, true);
        });
      }
      sendProductRequest({
        type: 'GET',
        url: '/products?price=' + price + '&searchIndex=' + searchIndex + '&itemPage=' + itemPage
      }, 0, $moreButton, 'search', appending, function() {
        if (noMoreStuff) {
          SMCUtil.show.info.alert.allProductsLoaded();
        }
      });
    };

    loadUserFavorites = function(index, appending) {
      index = index || 0;
      if (SMC.user && SMC.user.favorites) {
        var totalFavorites = SMC.user.favorites.length;
        if (totalFavorites < 1) {
          SMCUtil.show.info.alert.noFavorites();
          return;
        } else if (totalFavorites < index) {
          SMCUtil.removeMoreButton();
          SMCUtil.show.info.alert.allFavoritesLoaded();
          return;
        }
      } else {
        SMCUtil.show.info.alert.noFavorites();
      }
      if (totalFavorites > index) {
        var $moreButton = SMCTemplate.moreButton();
        $moreButton.click(function() {
          loadUserFavorites(index + 10, true);
        });
      } else {
        SMCUtil.show.info.alert.allFavoritesLoaded();
      }
      sendProductRequest({
        type: 'GET',
        url: '/users/me/favorites?index=' + index
      }, 0, $moreButton, 'favorites', appending, function() {
        if (totalFavorites <= index + 10) {
          SMCUtil.removeMoreButton();
          SMCUtil.show.info.alert.allFavoritesLoaded();
        }
      });
    };

    sendProductRequest = function(req, requestAttempt, $moreButton, location, appending, successCallback) {
      SMCUtil.removeMoreButton();
      if (requestAttempt >= SMCConstants.MAX_REQUEST_RETRIES) {
        if (appending) {
          SMCUtil.show.error.alert.maxRequestRetriesReachedOnBottom();
        } else {
          SMCUtil.show.error.alert.maxRequestRetriesReachedOnTop();
        }
        return;
      }
      if (appending) {
        SMCUtil.showBottomLoadingGif();
      } else {
        SMCUtil.showTopLoadingGif();
      }
      $.ajax({
        type: req.type,
        url: req.url,
        success: function(data, textStatus, xhr) {
          var amazonResponseItem;
          SMCUtil.hideLoadingGif();
          if (!appending) {
            SMCUtil.removeProductPanels();
          }
          SMC.response = data;
          if (responseIsSuccess(xhr)) {
            amazonResponseItem = getAmazonResponseItem(data);
          }
          if (amazonResponseItem) {
            SMCSetup.setupProductView(amazonResponseItem, $moreButton);
            SMCSetup.setupHover();
            if (successCallback) {
              successCallback();
            }
            SMC.location = location;
          } else {
            sendProductRequest(req, requestAttempt + 1, $moreButton, location, appending);
            SMCUtil.log(data);
          }
        },
        error: function(e) {
          SMCUtil.hideLoadingGif();
          if (appending) {
            SMCUtil.show.error.alert.problemLoadingProductsOnBottom();
          } else {
            SMCUtil.show.error.alert.problemLoadingProductsOnTop();
          }
          SMCUtil.log(e);
        }
      });
    };

    return {
      sendProductRequest: function(req, requestAttempt, moreButton, location, appending) {
        sendProductRequest(req, requestAttempt, moreButton, location, appending);
      },
      loadUserFavorites: function(index, appending) {
        loadUserFavorites(index, appending);
      },
      onSearch: function() {
        var userInput = $('#user-input-price').val();
        if (/^[0-9]+\.[0-9]{0,2}$|^[0-9]+$|^Favorites$|^favorites$/.test(userInput)) {
          if (_.isFinite(userInput)) {
            searchWithPrice(Math.round(userInput * 100), $('#search-index-button').data('search-index').replace(/ /g, ''), 1);
          } else if (userInput.toLowerCase() === 'favorites') {
            loadUserFavorites();
          } else {
            SMCUtil.show.info.alert.onlyNumbers();
          }
        } else {
          SMCUtil.show.info.alert.onlyNumbers();
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
            } else {
              $('#favorites-button').hide();
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
              SMC.user.favorites = data;
              item.data('is-favorite', true);
              item.attr('title', 'Remove from favorites');
              SMCUtil.show.success.alert.favoriteAdded();
            } else {
              SMCUtil.show.error.alert.unknownProblemOnTop();
            }
          },
          error: function(e) {
            SMCUtil.show.error.alert.unknownProblemOnTop();
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
              SMCUtil.show.success.alert.favoriteRemoved();
              SMC.user.favorites = data;
              if (SMC.location === 'favorites') {
                item.parents('.product-panel').remove();
              }
              item.data('is-favorite', false);
              item.attr('title', 'Save to favorites');
            } else {
              SMCUtil.show.error.alert.unknownProblemOnTop();
            }
          },
          error: function(e) {
            SMCUtil.show.error.alert.unknownProblemOnTop();
            SMCUtil.log(e);
          }
        });
      },
      getAvailablePreferences: function(callback) {
        $.ajax({
          type: 'GET',
          url: '/users/preferences',
          success: function(data, testStatus, xhr) {
            SMC.response = data;
            if (responseIsSuccess(xhr)) {
              callback(data);
            } else {
              SMCUtil.show.error.alert.unableToLoadCategories();
            }
          }
        });
      }
    };
  })();

  SMCUtil = (function() {
    var exclamations;
    var feelFreeToContactUs;
    var showAlertWithRandomExclamation;
    var showLoadingGif;
    var addElementToInfoStuff;

    exclamations = {
      normal: [],
      error: ['Whoops!', 'Hold it!', 'Ouch!', 'Er...', 'Sorry!', 'Hmmm...', 'Oh No!'],
      success: ['Sweet!', 'Awesome!', 'Rock On!', 'Cool!', 'Nice!'],
      info: ['Heads Up!', 'Just FYI!', 'Just so you know...']
    };
    feelFreeToContactUs = '<a href="mailto:info@spendmycents.com">feel free to contact us...</a>';
    showAlertWithRandomExclamation = function(position, type, text) {
      var exclamation;
      if (exclamations[type] && exclamations[type].length > 0) {
        exclamation = exclamations[type][Math.floor(Math.random() * exclamations[type].length)];
      }
      SMCUtil.doShowAlert(position, type, (exclamation ? '<strong>' + exclamation + '</strong> ' : '') + text);
    };
    showLoadingGif = function(position) {
      var loadingGif = [
        '<div class=\'loading-image-container\'>',
        '<img src=\'../public/img/ajax-loader-light.gif\' class=\'loading-image\'>',
        '</div>'
      ].join('\n');
      addElementToInfoStuff(position, loadingGif);
    };

    addElementToInfoStuff = function(position, element) {
      $('#' + position + '-info-stuff').append(element);
    };

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
        var newTitle = title;
        if (title.length > SMCConstants.MAX_TITLE_LENGTH) {
          newTitle = _.first(title, SMCConstants.MAX_TITLE_LENGTH).join('') + '...';
        }
        return newTitle;
      },
      showTopLoadingGif: function() {
        showLoadingGif('top');
      },
      showBottomLoadingGif: function() {
        showLoadingGif('bottom');
      },
      hideLoadingGif: function() {
        $('.loading-image-container').remove();
      },
      removeProductPanels: function() {
        $('.product-panel').remove();
      },
      show: {
        normal: {
          alert: {
            custom: function(position, text) {
              showAlertWithRandomExclamation(position, 'normal', text);
            }
          }
        },
        error: {
          alert: {
            contactUs: '<br />If this happens a lot, ' + feelFreeToContactUs,
            custom: function(position, text) {
              showAlertWithRandomExclamation(position, 'error', text);
            },
            maxRequestRetriesReachedOnTop: function() {
              maxRequestRetriesReached('top');
            },
            maxRequestRetriesReachedOnBottom: function() {
              maxRequestRetriesReached('bottom');
            },
            maxRequestRetriesReached: function(position) {
              showAlertWithRandomExclamation(position, 'error', 'We tried and tried, but couldn\'t get any results for you!' + this.contactUs);
            },
            unableToLoadCategories: function() {
              showAlertWithRandomExclamation('top', 'error', 'Couldn\'t load available categories. You will not be able to select specific areas to search :-(' + this.contactUs);
            },
            problemLoadingProductsOnTop: function() {
              this.problemLoadingProducts('top');
            },
            problemLoadingProductsOnBottom: function() {
              this.problemLoadingProducts('bottom');
            },
            problemLoadingProducts: function(position) {
              showAlertWithRandomExclamation(position, 'error', 'There was a problem getting the products!' + this.contactUs);
            },
            unknownProblemOnTop: function() {
              this.unknownProblem('top');
            },
            unknownProblemOnBottom: function() {
              this.unknownProblem('bottom');
            },
            unknownProblem: function(position) {
              showAlertWithRandomExclamation(position, 'error', 'Something weird happened... Not totally sure what.' + this.contactUs);
            }
          }
        },
        success: {
          alert: {
            contactUs: '<br />If this makes you jump for joy, ' + feelFreeToContactUs,
            custom: function(position, text) {
              showAlertWithRandomExclamation(position, 'success', text);
            },
            favoriteRemoved: function() {
              var exclamations = ['Syanora', 'Adios', 'Ciao', 'See Yah', 'Removed', 'Goodbye'];
              var exclamation = exclamations[Math.floor(Math.random() * exclamations.length)];
              SMCUtil.doShowAlert('top', 'success', '<strong>' + exclamation + '!</strong> That item is no longer a favorite.');
            },
            favoriteAdded: function() {
              showAlertWithRandomExclamation('top', 'success', 'Another item on the favorites list.');
            }
          }
        },
        info: {
          alert: {
            custom: function(position, text) {
              showAlertWithRandomExclamation(position, 'info', text);
            },
            noFavorites: function() {
              showAlertWithRandomExclamation('top', 'info', 'It looks like you don\'t have any favorites. Give that a try!');
            },
            onlyNumbers: function() {
              SMCUtil.doShowAlert('top', 'info', '<strong>Whoa!</strong> Easy there tiger. We only do numbers.');
            },
            allFavoritesLoaded: function() {
              SMCUtil.doShowAlert('bottom', 'info', '<strong>That\'s it!</strong> These are all of your favorites. You could always add some more!');
            },
            allProductsLoaded: function() {
              var random = !!Math.floor(Math.random() * 2);
              var addOrSubtract = (random ? 'adding' : 'subtracting');
              SMCUtil.doShowAlert('bottom', 'info', ['<strong>That\'s all!</strong> Amazon limits us to showing 50 results total.',
                '<br /> But you\'ll get totally new results by simply ' + addOrSubtract + ' one cent or changing the category.'].join('\n'));
            }
          }
        }
      },
      doShowAlert: function(position, type, text) {
        var alertId, $alert

        alertId = 'current-alert-' + position;
        $('#' + alertId).remove();
        $alert = $('<div id="' + alertId + '" class="alert alert-' + type + '" style="display=none;">' + text + '</div>');

        addElementToInfoStuff(position, $alert);
        $alert.fadeIn();

        setTimeout(function() {
          $alert.fadeOut('slow', function() {
            $alert.remove();
          });
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
      MAX_ITEM_PAGES: 5,
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
        return product.ItemAttributes[0].Title[0] || 'Title not provided.';
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
      loadPreferences: function() {
        var i, listParent, listItemTemplate, listItem,
          checkItem, uncheckItem, isSelected,
          onHover, offHover, onClick;

        checkItem = function(obj) {
          obj.addClass('icon-circle');
          obj.removeClass('icon-circle-blank');
        };

        uncheckItem = function(obj) {
          obj.addClass('icon-circle-blank');
          obj.removeClass('icon-circle');
        };

        isSelected = function(obj) {
          return obj.data('selected');
        };

        onHover = function(obj) {
          if (isSelected(obj)) {
            uncheckItem(obj);
          } else {
            checkItem(obj);
          }
        };

        offHover = function(obj) {
          if (isSelected(obj)) {
            checkItem(obj);
          } else {
            uncheckItem(obj);
          }
        };

        onClick = function(obj) {
          checkItem(obj);
          obj.data('selected', true);
          $('#search-index-button').data('search-index', obj.data('search-index'));
          $('#search-index-button').html(obj.data('search-index') + ' <span class=\'caret\'></span>');
        };

        SMCRequest.getAvailablePreferences(function(preferences) {
          listParent = $('#search-index-list');
          listItemTemplate = $('<li class=\'search-index-item\'></li>');
          for (i = 0; i < preferences.length; i++) {
            listItem = listItemTemplate.clone();

            listItem.html('<a class=\'icon-circle-blank\' data-selected=\'false\' data-search-index=\'' + preferences[i] + '\'> ' + preferences[i] + '</a>');
            listParent.append(listItem);
            listItem.click(function() {
              listParent.find('a').data('selected', false).removeClass('icon-circle').addClass('icon-circle-blank');
              onClick($(this).find('a'));
            });
            listItem.hover(function() {
              onHover($(this).find('a'));
            }, function() {
              offHover($(this).find('a'));
            });
            if (i < 1) {
              listItem.click();
            }
          }

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
        $('#user-status-button').html(SMC.user['name'] + '  &nbsp;<span class=\'caret\'></span>');
        $('li.login').remove();

        var logoutHTML = '<li class="logout"><span class="logout"><h5>All done? Click below to sign out.</h5></span></li>' +
          '<li class="logout divider"></li>' +
          '<li class="logout"><span><a href="/auth/logout" id="logout-button" class="btn">' +
          'Sign Out' +
          '</a></span></li>';

        $('#login-dropdown').append(logoutHTML);
      },
      setupProductView: function(amazonProductsResponse, $moreButton) {
        var i, $productContainer;
        SMCUtil.hideLoadingGif();

        for (i = 0; i < amazonProductsResponse.length; i += 1) {
          var productResponseItem, productPanelTemplate, product;

          productResponseItem = amazonProductsResponse[i];
          product = ProductSetup.getProductFromAmazonResponsePortion(productResponseItem);

          productPanelTemplate = SMCTemplate.productPanel(product);

          $productContainer = $('#product-container');

          $productContainer.append(productPanelTemplate);
          if ($moreButton) {
            $productContainer.append($moreButton);
          }
        }
        if (SMC.user) {
          FavoritesSetup.setup();
        }
      },
      setupSocialMedia: function() {
        var applyToLink, setupFacebook, setupGoogle, setupLinkedIn, setupPinterest, setupEmail;
        var title = 'Spend My Cents';
        var url = encodeURIComponent('http://www.spendmycents.com');
        var image = encodeURIComponent('http://www.spendmycents.com/thumbnail.png');
        var description = encodeURIComponent($('meta[name=description]').attr('content'));

        setupFacebook = function() {
          var fUrl = encodeURIComponent('p[url]') + '=' + url;
          var fTitle = encodeURIComponent('p[title]') + '=' + title;
          var fSummary = encodeURIComponent('p[summary]') + '=' + description;
          var fImages = encodeURIComponent('p[images][0]') + '=' + image;
          var uri = 'http://www.facebook.com/sharer.php?s=100';
          applyToLink('facebook', uri, [fUrl, fTitle, fSummary, fImages]);
          //http://www.facebook.com/sharer/sharer.php?s=100&p%5Btitle%5D=Daddy+Design&p%5Bsummary%5D=Become+a+fan+of+Daddy+Design%21&p%5Burl%5D=http%3A%2F%2Fwww.facebook.com%2Fwordpressdesign&p%5Bimages%5D%5B0%5D=http%3A%2F%2Fwww.daddydesign.com%2FClientsTemp%2FTutorials%2Fcustom-iframe-share-button%2Fimages%2Fthumbnail.jpg&
        };

        setupTwitter = function() {
          var tUrl = 'url=' + url;
          var tSummary = 'text=' + encodeURIComponent('Checkout @spendmycents, the new reverse product search web app. Search @amazon by price.');
          var uri = 'http://twitter.com/intent/tweet?';
          applyToLink('twitter', uri, [tUrl, tSummary]);
        };

        setupLinkedIn = function() {
          var lUrl = 'url=' + url;
          var lTitle = 'title=' + title;
          var lSummary = 'summary=' + description;
          var lSource = 'source=' + url;
          var uri = 'http://www.linkedin.com/shareArticle?mini=true';
          applyToLink('linkedin', uri, [lUrl, lTitle, lSummary, lSource]);
          //http://www.linkedin.com/shareArticle?mini=true&url=http://bit.ly/adaptxt-beta-android&title=http://bit.ly/adaptxt-beta-android&summary=http://bit.ly/adaptxt-beta-android&source=http://bit.ly/adaptxt-beta-android
        };

        setupPinterest = function() {
          var pUrl = 'url=' + url;
          var pMedia = 'media=' + image;
          var pDescription = 'description=' + description;
          var uri = 'http://pinterest.com/pin/create/button/?';
          applyToLink('pinterest', uri, [pUrl, pMedia, pDescription]);
          //<a href="http://pinterest.com/pin/create/button/?url=<?php the_permalink();?>&media=<?php echo gangmei_get_the_post_thumbnail_url($post->ID, 'large'); ?>&description=<?php echo get_the_excerpt(); ?>" onclick="window.open(this.href); return false;">Pinterest</a>
        };

        setupEmail = function() {
          var eSubject = 'subject=' + title;
          var eBody = 'body=' + description + encodeURIComponent(' - Check it out at http://www.spendmycents.com');
          var uri = 'mailto:?';
          applyToLink('email', uri, [eSubject, eBody]);
        };

        applyToLink = function(platform, uri, uriComponents) {
          $('a.share.' + platform).attr('href', uri + '&' + uriComponents.join('&'));
        };

        setupFacebook();
        setupTwitter();
        setupLinkedIn();
        setupPinterest();
        setupEmail();
      },
      enableKeyboardNavigationForDropdowns: function() {
        $('.dropdown').bind('keydown', function(evt) {
          var $this = $(this);
          switch (evt.keyCode) {
            case 13: // Enter key
            case 32: // Space bar
            case 38: // Up arrow
            case 40: // Down arrow
              $this.addClass("open");
              $this.find('.dropdown-menu a:first').focus();
              break;
            case 27: // Escape key
              $this.removeClass("open");
              $this.focus();
              break;
          }
        });

        $('.dropdown-menu a').bind('keydown', function(evt) {
          var $this = $(this);

          function selectPrevious() {
            $this.parent('li').prev().find('a').focus();
            evt.stopPropagation();
          }

          function selectNext() {
            $this.parent('li').next().find('a').focus();
            evt.stopPropagation();
          }

          switch (evt.keyCode) {
            case 13: // Enter key
            case 32: // Space bar
              $this.click();
              $this.closest('.dropdown').removeClass('open');
              evt.stopPropagation();
              break;
            case 9: // Tab key
              if (evt.shiftKey) {
                selectPrevious();
              }
              else {
                selectNext();
              }
              evt.preventDefault();
              break;
            case 38: // Up arrow
              selectPrevious();
              break;
            case 40: // Down arrow
              selectNext();
              break;
          }
        });
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
      SMCSetup.loadPreferences();
      SMCSetup.setupSocialMedia();
//      SMCSetup.enableKeyboardNavigationForDropdowns();
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
