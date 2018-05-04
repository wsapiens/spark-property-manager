var table;
var tenantId;
$(document).ready(function(){
  $('#property-select').find('option').remove();
  $('#unit-select').find('option').remove();
  $.get("/properties", function(data, status){
    console.log(data['data']);
    $('#property-select').append('<option>Select Property</option>');
    $.each(data['data'], function(key, value){
      console.log(value);
      console.log(value['id']);
      console.log(value['address_street']);
      $('#property-select').append('<option value=' + value['id'] + '>'
                                  + value['address_street'] + ', '
                                  + value['address_city'] + ','
                                  + value['address_state']
                                  + value['address_zip']
                                  + '</option>');
    });
    if(data['data'].length > 0) {
      $('#property-select option:first').attr("selected",true);
    }
      //$('#property-select').val($('#property-select option:first').val());
  });

  $('#property-select').on('change', function() {
    $('#unit-select').find('option').remove();
    $('#unit-select').append('<option>Select Unit</option>');
    $.get("/properties/" + $(this).val() + "/units", function(data, status){
      console.log(data['data']);
      $.each(data['data'], function(key, value){
        console.log(value);
        console.log(value['id']);
        console.log(value['name']);
        $('#unit-select').append('<option value=' + value['id'] + '>' + value['name'] + '</option>');
      });
      if(data['data'] && data['data'].length === 0) {
        $('#unit-select').val($('#unit-select option:first').val()).change();
      }
    });
  });

  $('#submit-button').on('click', function() {
    var unitId = $('#unit-select').val();
    var firstName = $('#firstname-text').val();
    var lastName = $('#lastname-text').val();
    var phoneNumber = $('#phone-text').val();
    var emailAddress = $('#email-text').val();
    var startDate = $('#lease-start-date').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    var endDate = $('#lease-end-date').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    if( unitId && firstName ) {
      if(tenantId) {
        $.ajax({
          url:"/tenants/"+tenantId,
          type: "PUT",
          data: JSON.stringify({
                  unit_id: unitId,
                  firstname: firstName,
                  lastname: lastName,
                  phone: phoneNumber,
                  email: emailAddress,
                  lease_start: startDate,
                  lease_end: endDate
               }),
          contentType: "application/json; charset=utf-8",
          // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
          dataType: "json",
          statusCode: {
            200: function() {
              $('#property-select option:selected').prop('selected', false).change();
              $('#unit-select option:selected').prop('selected', false).change();
              $('#firstname-text').val('');
              $('#lastname-text').val('');
              $('#phone-text').val('');
              $('#email-text').val('');
              $('#lease-start-date').datepicker('setDate', null);
              $('#lease-end-date').datepicker('setDate', null);
              tenantId = null;
              refreshTable(table, false);
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
        $.post("/tenants", {
            unit_id: unitId,
            firstname: firstName,
            lastname: lastName,
            phone: phoneNumber,
            email: emailAddress,
            lease_start: startDate,
            lease_end: endDate
         })
         .done(function(data) {
            console.log(data);
            table.api().ajax.url("/tenants").load();
            $('#unit-select option:selected').prop('selected', false).change();
            $('#property-select option:selected').prop('selected', false).change();
            $('#firstname-text').val('');
            $('#lastname-text').val('');
            $('#phone-text').val('');
            $('#email-text').val('');
            $('#lease-start-date').datepicker('setDate', null);
            $('#lease-end-date').datepicker('setDate', null);
            $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            receiptFile = '';
          });
      }
    } else {
      alert('Property Unit and Firstname are required!')
    }
  });

  table = $('#tenants').dataTable({
            "ajax": "/tenants",
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
                { "data": "id", "width" : "8%", className: 'dt-body-center' },
                { "data": "unit_id", "width" : "10%", className: 'dt-body-center' },
                { "data": "firstname", className: 'dt-body-center' },
                { "data": "lastname", className: 'dt-body-center' },
                { "data": "phone", className: 'dt-body-center'},
                { "data": "email", "width" : "10%" },
                { "data": "lease_start", className: 'dt-body-center' },
                { "data": "lease_end", className: 'dt-body-center' }
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
  $('#tenants tbody').on('click', 'input[type="checkbox"]', function(e){
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
  $('#tenants').on('click', 'tbody td, thead th:first-child', function(){
    $(this).parent().find('input[type="checkbox"]').trigger('click');
  });

  // Handle click on "Select all" control
  $('thead input[name="select_all"]', table.api().table().container()).on('click', function(e){
    if(this.checked){
      $('#tenants tbody input[type="checkbox"]:not(:checked)').trigger('click');
    } else {
      $('#tenants tbody input[type="checkbox"]:checked').trigger('click');
    }

    // Prevent click event from propagating to parent
    e.stopPropagation();
  });

  // Handle table draw event
  table.on('draw', function(){
    // Update state of "Select all" control
    updateDataTableSelectAllCtrl(table);
  });

  $('#lease-start-date' ).datepicker({
    onSelect: function (date, instance) {
    }
  });

  $('#lease-end-date' ).datepicker({
    onSelect: function (date, instance) {
    }
  });
});

$(document).on('click', '#delete-button', function(){
  if(0 !== rows_selected.length) {
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/tenants/"+value['id'],
        type: "DELETE",
        // data: JSON.stringify({"ids": ids}),
        contentType: "application/json; charset=utf-8",
        // headers: { "X-XSRF-TOKEN": $.cookie("XSRF-TOKEN")},
        dataType: "json",
        statusCode: {
          200: function() {
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
    $.get("/tenants/"+rows_selected[0]['id'], function(data, status){
      if("success" === status) {
        $.get("/units/"+data['unit_id'], function(udata, ustatus){
          if("success" === ustatus) {
            $('#property-select').val(udata['property_id']).change();
            $('#firstname-text').val(data['firstname']);
            $('#lastname-text').val(data['lastname']);
            var phone = data['phone'];
            if(phone) {
              $('#phone-text').val(phone.substring(phone.indexOf(">")+1,phone.lastIndexOf("<")));
            }
            var email = data['email'];
            if(email) {
              $('#email-text').val(email.substring(email.indexOf(">")+1,email.lastIndexOf("<")));
            }
            var startDate = data['lease_start'].split('-');
            $('#lease-start-date').datepicker('setDate', new Date(startDate[0], startDate[1]-1, startDate[2]));
            var endDate = data['lease_end'].split('-');
            $('#lease-end-date').datepicker('setDate', new Date(endDate[0], endDate[1]-1, endDate[2]));
            tenantId = rows_selected[0]['id'];
            window.setTimeout(function(){
              console.log(">>>>>" + data['unit_id']);
              $('#unit-select').val(data['unit_id']).change();
            }, 500);
          }
        });
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
