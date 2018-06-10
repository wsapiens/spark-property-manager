var table;
var propertyId;
$(document).ready(function(){
  $('#property-type-select').find('option').remove();
  $.get("/types/property", function(data, status){
    console.log(data['data']);
    $('#property-type-select').append('<option>Select Property Type</option>');
    $.each(data['data'], function(key, value){
      console.log(value);
      console.log(value['id']);
      console.log(value['name']);
      $('#property-type-select').append('<option value=' + value['id'] + '>' + value['name'] + '</option>');
    });
    if(data['data'].length > 0) {
      $('#property-type-select option:first').attr("selected",true);
    }
  });

  $('#submit-button').on('click', function() {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    var typeId = $('#property-type-select').val();
    var addressStreet = $('#address-street-text').val();
    var addressCity = $('#address-city-text').val();
    var addressState = $('#address-state-text').val();
    var addressZip = $('#address-zip-text').val();
    var indexNumber = $('#index-text').val();
    console.log(typeId);
    console.log(addressStreet);
    console.log(addressCity);
    console.log(addressState);
    console.log(addressZip);
    console.log(indexNumber);
    if( typeId && addressStreet ) {
      if(propertyId) {
        $.ajax({
          url:"/properties/"+propertyId,
          type: "PUT",
          data: JSON.stringify({
                                  type_id: typeId,
                                  address_street: addressStreet,
                                  address_city: addressCity,
                                  address_state: addressState,
                                  address_zip: addressZip,
                                  index_number: indexNumber
                                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              $('#property-type-select option:selected').prop('selected', false).change();
              $('#address-street-text').val('');
              $('#address-city-text').val('');
              $('#address-state-text').val('');
              $('#address-zip-text').val('');
              $('#index-text').val('');
              propertyId = null;
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
          url:"/properties/",
          type: "POST",
          data: JSON.stringify({
                  type_id: typeId,
                  address_street: addressStreet,
                  address_city: addressCity,
                  address_state: addressState,
                  address_zip: addressZip,
                  index_number: indexNumber
                }),
          contentType: "application/json; charset=utf-8",
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/properties").load();
              $('#property-type-select option:selected').prop('selected', false).change();
              $('#address-street-text').val('');
              $('#address-city-text').val('');
              $('#address-state-text').val('');
              $('#address-zip-text').val('');
              $('#index-text').val('');
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
      alert('Property Type and Street Address are required!')
    }
  });

  table = $('#properties').dataTable({
            ajax: "/properties",
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
                { data: 'address_street', className: 'dt-body-center' },
                { data: 'address_city', className: 'dt-body-center'},
                { data: 'address_state', className: 'dt-body-center', "width" : "10%" },
                { data: 'address_zip', className: 'dt-body-center' },
                { data: 'PropertyType',
                  width : '10%',
                  className: 'dt-body-center',
                  render: function (PropertyType) {
                            return PropertyType['name'];
                          }
                },
                { data: 'index_number', className: 'dt-body-center' }
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
  $('#properties tbody').on('click', 'input[type="checkbox"]', function(e){
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
  $('#properties').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#properties tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#properties tbody input[type="checkbox"]:checked').trigger('click');
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
        url:"/properties/"+value['id'],
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
    $.get("/properties/"+rows_selected[0]['id'], function(data, status){
      if("success" === status) {
        $('#property-type-select').val(data['type_id']).change();
        $('#address-street-text').val(data['address_street']);
        $('#address-city-text').val(data['address_city']);
        $('#address-state-text').val(data['address_state']);
        $('#address-zip-text').val(data['address_zip']);
        $('#index-text').val(data['index_number']);
        propertyId = rows_selected[0]['id'];
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
