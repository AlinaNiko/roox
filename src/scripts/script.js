$(function() {

  'use strict';

  /* ===============================
  COMMON
  =============================== */

  var $popup = $( '.js-popup' );
  var $anchor = $( '.js-anchor' );
  var $modal = $('.modal'  );
  var $close = $( '.popup-request__button-close' );
  var $overlay = $( '.modal__overlay' );
  var $menuBtn = $( '.navigation__button' );


  // Run to section ==================================
  if ( $anchor.length ) {
    $anchor.on('click', function(event) {

      event.preventDefault();

      var $that = $( this ), hb = $( 'body, html' );

      if ( $that.is( 'button' ) ) {
        hb.stop().animate({ scrollTop: $( '.' + $that.data( 'id' ) ).offset().top }, 1000);
      } else if ( $that.is( 'a' ) ) {
        hb.stop().animate({ scrollTop: $( '.' + $that.attr( 'href' ).replace('#', '') ).offset().top }, 1000);

        if ( $that.is( '.navigation__link' ) ) {
          $that.addClass( 'navigation__link--active' ).parent().siblings().find( '.navigation__link--active' ).removeClass( 'navigation__link--active' );
        }

      }

    });
  }


  // Init maskinput ==================================
  $( 'input[type="tel"]' ).mask( '+7 (999) 999 99 99' );

  $('.js-form').each(function () {
    var $that = $( this );
    $that.validate({
      rules: {
        name: {
          required: true
        },
        phone: {
          required: true
        },
        message: {
          required: true
        },
      },
      highlight: function( input ) {
        $( input ).addClass('has-error');
      },
      errorPlacement: function(error, element){

      },
      submitHandler: function( form ) {
        $.ajax({
          url: "mail.php",
          type: "POST",
          data: $( form ).serialize(),
          beforeSend: function() {
            $( '.preload' ).addClass( 'preload--show' );
          },
          success: function() {
            window.location.href = "thanks.html";
          }
        });
      }
    });
  });


  // Open/close menu on click ==================================
  $menuBtn.click( function () {
    $( this ).toggleClass( 'navigation__button--transform' ).closest( '.navigation' ).toggleClass( 'navigation--closed' ).toggleClass( 'navigation--opened' );
  } );


  // Open popup on click ==================================
  $popup.click( function () {
    $modal.removeClass('modal--closed').addClass('modal--opened');
  } );


  var closePopup = function() {
    $modal.removeClass('modal--opened').addClass('modal--closed');
  };


  // Close popup on click ==================================
  $close.click( function() {
    closePopup();
  } );


  $overlay.click( function() {
    closePopup();
  } );


  // Close popup on push ESC ==================================
  $(document).keyup(function(event) {
    if (event.keyCode === 27) {
      closePopup();
    }
  });


  /* ===============================
  END COMMON
  =============================== */

});