var table;
var methodId;
$(document).ready(function(){
  $('#payment-type-select').find('option').remove();
  $.get("/types/payment", function(data, status){
    console.log(data.data);
    $('#payment-type-select').append('<option>Select Property Type</option>');
    $.each(data.data, function(key, value){
      console.log(value);
      console.log(value.id);
      console.log(value.name);
      $('#payment-type-select').append('<option value=' + value.id + '>' + value.name + '</option>');
    });
    if(data.data.length > 0) {
      $('#payment-type-select option:first').attr("selected",true);
    }
  });

  $('#submit-button').on('click', function() {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    var typeId = $('#payment-type-select').val();
    var accountNumber = $('#account-number-text').val();
    var descriptionText = $('#description-text').val();
    console.log(typeId);
    console.log(accountNumber);
    console.log(descriptionText);
    if( typeId ) {
      if(methodId) {
        $.ajax({
          url:"/payments/methods/"+methodId,
          type: "PUT",
          data: JSON.stringify({
                                  type_id: typeId,
                                  account_number: accountNumber,
                                  description: descriptionText
                                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/payments/methods").load();
              $('#payment-type-select option:selected').prop('selected', false).change();
              $('#account-number-text').val('');
              $('#description-text').val('');
              methodId = null;
              // refreshTable(table, false);
              rows_selected=[];
              table.api().clear();
              table.api().ajax.reload();
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
        $.ajax({
          url:"/payments/methods/",
          type: "POST",
          data: JSON.stringify({
                  type_id: typeId,
                  account_number: accountNumber,
                  description: descriptionText
                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/payments/methods").load();
              $('#payment-type-select option:selected').prop('selected', false).change();
              $('#account-number-text').val('');
              $('#description-text').val('');
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
      }
    } else {
      alert('Payment Type is required!');
    }
  });

  table = $('#methods').dataTable({
            ajax: "/payments/methods",
            columns: [
                { data: null,
                  searchable: false,
                  orderable: false,
                  width: '4%',
                  className: 'dt-body-center',
                  render: function () {
                            return '<input type="checkbox">';
                          }
                },
                { data: 'id', width : '8%', className: 'dt-body-center' },
                { data: 'PaymentType',
                  width : '10%',
                  className: 'dt-body-center',
                  render: function (PaymentType) {
                            return PaymentType.name;
                          }
                },
                { data: 'account_number', className: 'dt-body-center' },
                { data: 'description', className: 'dt-body-center'}
            ],
            order: [[ 1, "desc" ]],
            processing: true,
            //"serverSide": true,
            paging: true,
            searching: true,
            pagingType: "full_numbers",
            scrollX: true,
            select: {
              style:    'os',
              selector: 'td:first-child'
            }
        }
  );

  // Handle click on checkbox
  $('#methods tbody').on('click', 'input[type="checkbox"]', function(e){
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
  $('#methods').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#methods tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#methods tbody input[type="checkbox"]:checked').trigger('click');
    }

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle table draw event
  table.on('draw', function(){
    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);
  });
});

$(document).on('click', '#delete-button', function(){
  var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  if(0 !== rows_selected.length) {
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/payments/methods/"+value.id,
        type: "DELETE",
        // data: JSON.stringify({"ids": ids}),
        contentType: "application/json; charset=utf-8",
        headers: { "CSRF-Token": token },
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
    $.get("/payments/methods/"+rows_selected[0].id, function(data, status){
      if("success" === status) {
        $('#payment-type-select').val(data.type_id).change();
        $('#account-number-text').val(data.account_number);
        $('#description-text').val(data.description);
        methodId = rows_selected[0].id;
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
