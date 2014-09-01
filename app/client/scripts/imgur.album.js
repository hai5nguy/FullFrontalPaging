$.get("https://api.imgur.com/3/album/zUv9K/images", function (imgurAlbumData) {
    $.each( imgurAlbumData.data, function( i, val ) {
      $("#owl-demo").append(
        '<div class="item"><img class="lazyOwl" data-src="' + val.link + '" alt="Lazy Owl Image"></div>'
      );
    });
    $(document).ready(function() {
      $("#owl-demo").owlCarousel({
        autoHeight: false,
        autoPlay: 9000,
        lazyEffect: false,
        lazyLoad : true,
        navigation : false,
        pagination: false,
        singleItem:true,
        transitionStyle : "fade"
      });
    });
});