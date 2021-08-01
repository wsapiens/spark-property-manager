var table;
var tenantId;
var rows_selected;
$(document).ready(function(){
  feather.replace()
  $('#property-select').find('option').remove();
  $('#unit-select').find('option').remove();
  $.get("/properties", function(data, status){
    console.log(data.data);
    $('#property-select').append('<option>Select Property</option>');
    $.each(data.data, function(key, value){
      console.log(value);
      console.log(value.id);
      console.log(value.address_street);
      $('#property-select').append('<option value=' + value.id + '>'
                                  + value.address_street + ', '
                                  + value.address_city + ', '
                                  + value.address_state + ' '
                                  + value.ddress_zip
                                  + '</option>');
    });
    if(data.data.length > 0) {
      $('#property-select option:first').attr("selected",true);
    }
      //$('#property-select').val($('#property-select option:first').val());
  });

  $('#property-select').on('change', function() {
    $('#unit-select').find('option').remove();
    $('#unit-select').append('<option>Select Unit</option>');
    if($(this).val() !== 'Select Property') {
      $.get("/properties/" + $(this).val() + "/units", function(data, status){
        $.each(data.data[0].PropertyUnits, function(key, value){
          $('#unit-select').append('<option value=' + value.id + '>' + value.name + '</option>');
        });
        if(data.data && data.data.length === 0) {
          $('#unit-select').val($('#unit-select option:first').val()).change();
        }
      });
    }
  });

  $('#submit-button').on('click', function() {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    var unitId = $('#unit-select').val();
    var firstName = $('#firstname-text').val();
    var lastName = $('#lastname-text').val();
    var phoneNumber = $('#phone-text').val();
    var emailAddress = $('#email-text').val();
    var startDate = $('#lease-start-date').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    var endDate = $('#lease-end-date').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    if( unitId && firstName && startDate && endDate ) {
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
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
              table.api().ajax.url("/tenants").load();
              $('#property-select option:selected').prop('selected', false).change();
              $('#unit-select option:selected').prop('selected', false).change();
              $('#firstname-text').val('');
              $('#lastname-text').val('');
              $('#phone-text').val('');
              $('#email-text').val('');
              $('#lease-start-date').datepicker('setDate', null);
              $('#lease-end-date').datepicker('setDate', null);
              tenantId = null;
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
          url:"/tenants/",
          type: "POST",
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
          headers: { "CSRF-Token": token },
          dataType: "json",
          statusCode: {
            200: function() {
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
      alert('Property Unit, Firstname, LeaseStartDate and LeaseEndDate are required!');
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
                { data: 'id', width: '8%', className: 'dt-body-center' },
                { data: 'PropertyUnit',
                  width: '10%',
                  className: 'dt-body-center',
                  render: function (PropertyUnit) {
                            return PropertyUnit.Property.address_street + ' ' + PropertyUnit.name;
                          }
                 },
                { data: 'firstname', className: 'dt-body-center' },
                { data: 'lastname', className: 'dt-body-center' },
                { data: 'phone',
                  className: 'dt-body-center',
                  render: function (phone) {
                            return '<a href="tel:' + phone + '">' + phone + '</a>';
                          }
                },
                { data: 'email',
                  width : '10%',
                  className: 'dt-body-center',
                  render: function (email) {
                            return '<a href="mailto:' + email + '">' + email + '</a>';
                          }
                },
                { data: 'lease_start', className: 'dt-body-center' },
                { data: 'lease_end', className: 'dt-body-center' }
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
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    $.each(rows_selected, function(key, value){
      $.ajax({
        url:"/tenants/"+value.id,
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
    $.get("/tenants/"+rows_selected[0].id, function(data, status){
      if("success" === status) {
        $.get("/units/"+data.unit_id, function(udata, ustatus){
          if("success" === ustatus) {
            $('#property-select').val(udata.property_id).change();
            $('#firstname-text').val(data.firstname);
            $('#lastname-text').val(data.lastname);
            $('#phone-text').val(data.phone);
            $('#email-text').val(data.email);
            var startDate = data.lease_start.split('T')[0].split('-');
            $('#lease-start-date').datepicker('setDate', new Date(startDate[0], startDate[1]-1, startDate[2]));
            var endDate = data.lease_end.split('T')[0].split('-');
            $('#lease-end-date').datepicker('setDate', new Date(endDate[0], endDate[1]-1, endDate[2]));
            tenantId = rows_selected[0].id;
            window.setTimeout(function(){
              console.log(">>>>>" + data.unit_id);
              $('#unit-select').val(data.unit_id).change();
            }, 500);
          }
        });
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });
  }
});
