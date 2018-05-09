
$(document).ready(function(){

  $('#upload-button').on('click', function() {
    $.ajax({
        // Your server script to process the upload
        url: '/file/statement',
        type: 'POST',

        // Form data
        data: new FormData($('#file-upload-form')[0]),

        // Tell jQuery not to process data or worry about content-type
        // You *must* include these options!
        cache: false,
        contentType: false,
        processData: false,
        statusCode: {
          200: function(response) {
                console.log(response);
                $('#uploaded').val('<a href="/uploads/' + response + '" target="_blank">' + response + '</a>');
                $.mobile.loading( "hide" );
               }
        },

        // Custom XMLHttpRequest
        xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                // For handling the progress of the upload
                myXhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        // $('#progressbar').progressbar({
                        //     value: e.loaded,
                        //     max: e.total,
                        // });
                        var $this = $( this ),
                        theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
                        msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
                        textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
                        textonly = !!$this.jqmData( "textonly" );
                        html = $this.jqmData( "html" ) || "";
                        $.mobile.loading( "show", {
                          text: msgText,
                          textVisible: textVisible,
                          theme: theme,
                          textonly: textonly,
                          html: html
                        });
                    }
                } , false);
            }
            return myXhr;
        }
    });
  });

});
