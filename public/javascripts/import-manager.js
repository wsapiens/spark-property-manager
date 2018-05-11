var table;
var configId;
$(document).ready(function(){
  $('#submit-button').on('click', function() {
    var filterColumn = $('#filter-column-number').val();
    var filterKeyword = $('#filter-keyword-text').val();
    var dateColumn = $('#date-column-number').val();
    var dateFormat = $('#date-format-text').val();
    var payToColumn = $('#pay-to-column-number').val();
    var amountColumn = $('#amount-column-number').val();
    var categoryColumn = $('#category-column-number').val();
    var descriptionColumn = $('#description-column-number').val();
    if( filterColumn && filterKeyword && amountColumn && payToColumn ) {
      if(configId) {
        $.ajax({
          url:"/import/configs/"+configId,
          type: "PUT",
          data: JSON.stringify({
                  filter_column_number: filterColumn,
                  filter_keyword: filterKeyword,
                  date_column_number: dateColumn,
                  date_format: dateFormat,
                  pay_to_column_number: payToColumn,
                  amount_column_number: amountColumn,
                  category_column_number: categoryColumn,
                  description_column_number: descriptionColumn
               }),
          contentType: "application/json; charset=utf-8",
          // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
          dataType: "json",
          statusCode: {
            200: function() {
              $('#filter-column-number').val('');
              $('#filter-keyword-text').val('');
              $('#date-column-number').val('');
              $('#date-format-text').val('');
              $('#pay-to-column-number').val('');
              $('#amount-column-number').val('');
              $('#category-column-number').val('');
              $('#description-column-number').val('');
              configId = null;
              // refreshTable(table, false);
              rows_selected=[];
              table.api().clear();
              table.api().ajax.reload();
              // table.api().ajax.url("/import/configs").load();
              $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            },
            400: function(response) {
              resultPopup(response);
            },
            401: function() {
              location.reload();
            },
            500: function(response) {
              resultPopup(response);
            }
          }
        });
      } else {
        $.post("/import/configs", {
          filter_column_number: filterColumn,
          filter_keyword: filterKeyword,
          date_column_number: dateColumn,
          date_format: dateFormat,
          pay_to_column_number: payToColumn,
          amount_column_number: amountColumn,
          category_column_number: categoryColumn,
          description_column_number: descriptionColumn
         })
         .done(function(data) {
            table.api().ajax.url("/import/configs").load();
            $('#filter-column-number').val('');
            $('#filter-keyword-text').val('');
            $('#date-column-number').val('');
            $('#date-format-text').val('');
            $('#pay-to-column-number').val('');
            $('#amount-column-number').val('');
            $('#category-column-number').val('');
            $('#description-column-number').val('');
            $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            receiptFile = '';
          });
      }
    } else {
      alert('FilterColumnNumber, FilterKeyword, AmoutColumnNumber and PayToColumnNumber are required!')
    }
  });

  table = $('#configs').dataTable({
            "ajax": "/import/configs",
            "columns": [
                { data: null,
                  searchable: false,
                  orderable: false,
                  width: '4%',
                  className: 'dt-body-center',
                  render: function () {
                            return '<input type="checkbox">';
                          }
                },
                { data: 'id', width: '8%', className: 'dt-body-center' },
                { data: 'filter_column_number', className: 'dt-body-center' },
                { data: 'filter_keyword', className: 'dt-body-center' },
                { data: 'date_column_number', className: 'dt-body-center' },
                { data: 'date_format', className: 'dt-body-center' },
                { data: 'pay_to_column_number', className: 'dt-body-center' },
                { data: 'amount_column_number', className: 'dt-body-center' },
                { data: 'category_column_number', className: 'dt-body-center' },
                { data: 'description_column_number', className: 'dt-body-center' }
            ],
            "order": [[ 1, "desc" ]],
            "processing": true,
            //"serverSide": true,
            "paging": true,
            "searching": true,
            "pagingType": "full_numbers",
            "scrollX": true
        }
  );

  // Handle click on checkbox
  $('#configs tbody').on('click', 'input[type="checkbox"]', function(e){
    var $row = $(this).closest('tr');
    // Get row data
    var data = table.api().row($row).data();
    // Determine whether row ID is in the list of selected row IDs
    var index = $.inArray(data, rows_selected);

    // If checkbox is checked and row ID is not in list of selected row IDs
    if(this.checked && index === -1){
      rows_selected.push(data);
    // Otherwise, if checkbox is not checked and row ID is in list of selected row IDs
    } else if (!this.checked && index !== -1){
      rows_selected.splice(index, 1);
    }

    if(this.checked){
      $row.addClass('selected');
    } else {
      $row.removeClass('selected');
    }

    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle click on table cells with checkboxes
  $('#configs').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#configs tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#configs tbody input[type="checkbox"]:checked').trigger('click');
    }

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle table draw event
  table.on('draw', function(){
    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);
  });

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
                window.location.href = '/manager/expense';
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

$(document).on('click', '#delete-button', function(){
  if(0 !== rows_selected.length) {
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/import/configs/"+value['id'],
        type: "DELETE",
        // data: JSON.stringify({"ids": ids}),
        contentType: "application/json; charset=utf-8",
        // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
        dataType: "json",
        statusCode: {
          200: function() {
                rows_selected=[];
                refreshTable(table, true);
               },
          400: function(response) {
                resultPopup(response);
               },
          401: function() {
                location.reload();
               },
          500: function(response) {
                resultPopup(response);
               }
        }
      });
    });
  }
});

$(document).on('click', '#edit-button', function(){
  if(1 === rows_selected.length) {
    $.get("/import/configs/"+rows_selected[0]['id'], function(data, status){
      if("success" === status) {
        $('#filter-column-number').val(data['filter_column_number']);
        $('#filter-keyword-text').val(data['filter_keyword']);
        $('#date-column-number').val(data['date_column_number']);
        $('#date-format-text').val(data['date_format']);
        $('#pay-to-column-number').val(data['pay_to_column_number']);
        $('#amount-column-number').val(data['amount_column_number']);
        $('#category-column-number').val(data['category_column_number']);
        $('#description-column-number').val(data['description_column_number']);
        configId = rows_selected[0]['id'];
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
